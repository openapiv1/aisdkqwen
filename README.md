<a href="https://ai-sdk-starter-groq.vercel.app">
  <h1 align="center">AI SDK Computer Use Demo with Qwen</h1>
</a>

<p align="center">
  An open-source AI chatbot app demonstrating Qwen 3-VL's computer use capabilities via DashScope, built with Next.js and E2B sandbox.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- Streaming text responses with live AI message generation powered by Qwen 3-VL-235B-A22B-Instruct model via DashScope API.
- Integration with Qwen's vision and language capabilities for computer use and bash tool actions.
- Multi-step action execution with AI performing multiple actions in sequence
- Sandbox environment with [e2b](https://e2b.dev) for secure execution and desktop control.
- Real-time streaming of AI responses and action execution.
- [shadcn/ui](https://ui.shadcn.com/) components for a modern, responsive UI powered by [Tailwind CSS](https://tailwindcss.com).
- Built with the latest [Next.js](https://nextjs.org) App Router.

## Deploy Your Own

You can deploy your own version to Vercel by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?project-name=AI+SDK+Qwen+Computer+Use&repository-name=ai-sdk-qwen-computer-use&repository-url=https%3A%2F%2Fgithub.com%2Fopenapiv1%2Faisdkqwen&demo-title=AI+SDK+Qwen+Computer+Use+Demo&demo-description=A+chatbot+application+built+with+Next.js+demonstrating+Qwen+3-VL+computer+use+capabilities&env=DASHSCOPE_API_KEY,E2B_API_KEY)

## Running Locally

1. Clone the repository and install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Create a `.env.local` file with your API keys:

   ```bash
   DASHSCOPE_API_KEY=your_dashscope_api_key_here
   E2B_API_KEY=your_e2b_api_key_here
   ```

   You can get:
   - DashScope API key from [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
   - E2B API key from [https://e2b.dev/](https://e2b.dev/)

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view your new AI chatbot application.

## Authors

This repository is maintained by the [Vercel](https://vercel.com) team and community contributors.

Contributions are welcome! Feel free to open issues or submit pull requests to enhance functionality or fix bugs.
