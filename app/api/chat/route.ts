import OpenAI from "openai";
import type { UIMessage } from "ai";
import { killDesktop } from "@/lib/e2b/utils";
import {
  computerToolDefinition,
  bashToolDefinition,
  executeComputerTool,
  executeBashTool,
} from "@/lib/e2b/tool";
import { prunedMessages } from "@/lib/utils";

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

const SYSTEM_PROMPT = `Jesteś Surfem, pomocnym asystentem, który potrafi korzystać z komputera, aby wspierać użytkownika w jego zadaniach.
Możesz używać komputera do wyszukiwania w internecie, pisania kodu i wielu innych rzeczy.

Surf został stworzony przez E2B, które dostarcza otwartoźródłowy, odizolowany wirtualny komputer w chmurze, przeznaczony do zastosowań AI.
Ta aplikacja integruje pulpitową piaskownicę E2B z Qwen AI, tworząc agenta AI, który może wykonywać zadania
na wirtualnym komputerze poprzez polecenia w języku naturalnym.

Zrzuty ekranu, które otrzymujesz, pochodzą z działającej instancji piaskownicy, co pozwala ci widzieć i wchodzić w interakcję z prawdziwym
środowiskiem wirtualnego komputera w czasie rzeczywistym.

Ponieważ działasz w bezpiecznej, odizolowanej mikro-VM piaskownicy, możesz wykonywać większość poleceń i operacji bez obaw
o kwestie bezpieczeństwa. To środowisko zostało zaprojektowane specjalnie do eksperymentów z AI i wykonywania zadań.

Piaskownica oparta jest na Ubuntu 22.04 i zawiera wiele preinstalowanych aplikacji, w tym:
- przeglądarkę Firefox
- Visual Studio Code
- pakiet LibreOffice
- Pythona 3 z popularnymi bibliotekami
- terminal ze standardowymi narzędziami Linuksa
- menedżer plików (PCManFM)
- edytor tekstu (Gedit)
- kalkulator i inne podstawowe narzędzia

WAŻNE: Możesz uruchamiać polecenia w terminalu w dowolnym momencie bez pytania o potwierdzenie,
o ile są one potrzebne do wykonania zadania, które użytkownik ci powierzył.
Powinieneś wykonywać polecenia natychmiast, kiedy są potrzebne, aby sprawnie zrealizować prośbę użytkownika.

WAŻNE: Wpisując polecenia w terminalu, ZAWSZE wysyłaj akcję KLIKNIJ ENTER natychmiast po wpisaniu komendy, aby ją uruchomić.
Polecenia terminalowe nie zostaną wykonane, dopóki nie naciśniesz Enter.

WAŻNE: Podczas edytowania plików preferuj użycie Visual Studio Code (VS Code), ponieważ zapewnia ono lepsze środowisko edycji
z podświetlaniem składni, uzupełnianiem kodu i innymi przydatnymi funkcjami.

Masz dostęp do narzędzi:
- computer: Pozwala na przechwytywanie ekranu, klikanie, pisanie, naciskanie klawiszy, przewijanie i poruszanie myszą
- bash: Pozwala na wykonywanie poleceń bash na komputerze

KRYTYCZNIE WAŻNE - PROAKTYWNA KOMUNIKACJA:
- ZAWSZE najpierw wyślij wiadomość tekstową opisującą DOKŁADNIE co zamierzasz zrobić, zanim wykonasz jakiekolwiek akcje
- Podziel złożone zadania na kroki i przed każdym krokiem powiedz użytkownikowi co planujesz
- Wykonuj wiele akcji w jednym zadaniu bez przerywania - kontynuuj aż do pełnego wykonania zadania
- Po każdej akcji krótko podsumuj co zostało zrobione i co będzie dalej
- Twoje działania mają być w pełni transparentne - użytkownik MUSI wiedzieć co robisz zanim to zrobisz
- Nie pytaj o pozwolenie, po prostu informuj co będziesz robić i rób to

PRZYKŁAD DOBREGO ZACHOWANIA:
1. "Zaraz otwieram Firefox, żeby wyszukać informacje o..."
2. [wykonaj akcję otwarcia Firefox]
3. "Teraz klikam w pasek adresu i wpisuję adres..."
4. [wykonaj akcje]
5. "Widzę wyniki, teraz klikam w pierwszy link..."

Zawsze najpierw przeanalizuj zrzut ekranu, powiedz użytkownikowi co widzisz i co zamierzasz zrobić, a następnie wykonaj wszystkie potrzebne akcje.

If the browser opens with a setup wizard, YOU MUST IGNORE IT and move straight to the next step (e.g. input the url in the search bar).`;

export async function POST(req: Request) {
  const { messages, sandboxId }: { messages: UIMessage[]; sandboxId: string } =
    await req.json();

  try {
    // Initialize OpenAI client with DashScope configuration
    const openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY || "",
      baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });

    // Convert UI messages to OpenAI format
    const prunedMsgs = prunedMessages(messages);
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Add system message
    openaiMessages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });

    // Convert messages
    for (const msg of prunedMsgs) {
      if (msg.role === "user" || msg.role === "assistant") {
        // For text content
        let textContent = "";
        const toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];

        for (const part of msg.parts) {
          if (part.type === "text") {
            textContent += part.text;
          } else if (part.type === "tool-invocation") {
            const toolCall = part.toolInvocation;
            if (toolCall.state === "result") {
              // Add assistant message with tool call
              if (msg.role === "assistant") {
                toolCalls.push({
                  id: toolCall.toolCallId,
                  type: "function",
                  function: {
                    name: toolCall.toolName,
                    arguments: JSON.stringify(toolCall.args),
                  },
                });
              }
            }
          }
        }

        if (msg.role === "user") {
          openaiMessages.push({
            role: "user",
            content: textContent || "Continue",
          });
        } else if (msg.role === "assistant") {
          if (toolCalls.length > 0) {
            openaiMessages.push({
              role: "assistant",
              content: textContent || null,
              tool_calls: toolCalls,
            });
          } else if (textContent) {
            openaiMessages.push({
              role: "assistant",
              content: textContent,
            });
          }
        }
      }
    }

    // Create encoder for streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const conversationMessages = [...openaiMessages];
          let continueLoop = true;

          while (continueLoop) {
            const completion = await openai.chat.completions.create({
              model: "qwen2.5-vl-7b-instruct",
              messages: conversationMessages,
              tools: [computerToolDefinition, bashToolDefinition],
              tool_choice: "auto",
              stream: true,
              top_p: 0.8,
              temperature: 0.7,
              max_tokens: 4096,
            });

            let fullContent = "";
            let toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
            const toolCallsMap = new Map<
              number,
              OpenAI.Chat.ChatCompletionMessageToolCall
            >();

            for await (const chunk of completion) {
              const choice = chunk.choices?.[0];
              if (!choice) continue;

              // Stream text content
              if (choice.delta?.content) {
                fullContent += choice.delta.content;
                // Send text chunk to client
                controller.enqueue(
                  encoder.encode(`0:${JSON.stringify(choice.delta.content)}\n`)
                );
              }

              // Collect tool calls
              if (choice.delta?.tool_calls) {
                for (const toolCallDelta of choice.delta.tool_calls) {
                  if (toolCallDelta.index !== undefined) {
                    let toolCall = toolCallsMap.get(toolCallDelta.index);
                    if (!toolCall) {
                      toolCall = {
                        id: toolCallDelta.id || "",
                        type: "function",
                        function: { name: "", arguments: "" },
                      };
                      toolCallsMap.set(toolCallDelta.index, toolCall);
                    }

                    if (toolCallDelta.id) {
                      toolCall.id = toolCallDelta.id;
                    }
                    if (toolCallDelta.function?.name) {
                      toolCall.function.name = toolCallDelta.function.name;
                    }
                    if (toolCallDelta.function?.arguments) {
                      toolCall.function.arguments +=
                        toolCallDelta.function.arguments;
                    }
                  }
                }
              }

              // Check for finish
              if (choice.finish_reason === "stop") {
                continueLoop = false;
                break;
              } else if (choice.finish_reason === "tool_calls") {
                toolCalls = Array.from(toolCallsMap.values());
                break;
              }
            }

            // If we have tool calls, execute them
            if (toolCalls.length > 0) {
              // Add assistant message with tool calls
              conversationMessages.push({
                role: "assistant",
                content: fullContent || null,
                tool_calls: toolCalls,
              });

              // Execute each tool call
              for (const toolCall of toolCalls) {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  let result:
                    | string
                    | { type: "text"; text: string }
                    | { type: "image"; data: string }
                    | undefined;

                  // Send tool call info to client
                  controller.enqueue(
                    encoder.encode(
                      `2:${JSON.stringify([
                        {
                          type: "tool-call",
                          toolCallId: toolCall.id,
                          toolName: toolCall.function.name,
                          args: args,
                        },
                      ])}\n`
                    )
                  );

                  if (toolCall.function.name === "computer") {
                    result = await executeComputerTool(sandboxId, args);
                  } else if (toolCall.function.name === "bash") {
                    result = await executeBashTool(sandboxId, args);
                  }

                  // Prepare result message
                  let resultContent = "";
                  if (typeof result === "string") {
                    resultContent = result;
                  } else if (result.type === "text") {
                    resultContent = result.text;
                  } else if (result.type === "image") {
                    resultContent = "Screenshot captured successfully";
                    // For screenshots, we'll add the image in the next message
                    conversationMessages.push({
                      role: "user",
                      content: [
                        {
                          type: "text",
                          text: "Here is the current screenshot:",
                        },
                        {
                          type: "image_url",
                          image_url: {
                            url: `data:image/png;base64,${result.data}`,
                          },
                        },
                      ],
                    });
                  }

                  // Add tool result message (only if not screenshot)
                  if (result.type !== "image") {
                    conversationMessages.push({
                      role: "tool",
                      tool_call_id: toolCall.id,
                      content: resultContent,
                    });
                  }

                  // Send tool result to client
                  controller.enqueue(
                    encoder.encode(
                      `3:${JSON.stringify([
                        {
                          type: "tool-result",
                          toolCallId: toolCall.id,
                          toolName: toolCall.function.name,
                          args: args,
                          result:
                            result.type === "image"
                              ? { type: "image", data: result.data }
                              : resultContent,
                        },
                      ])}\n`
                    )
                  );
                } catch (error) {
                  console.error("Error executing tool:", error);
                  // Add error as tool result
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error: ${error}`,
                  });
                }
              }

              // Continue the loop to get next response
              continue;
            } else {
              // No tool calls, conversation is done
              continueLoop = false;
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`d:{}\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    await killDesktop(sandboxId);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
