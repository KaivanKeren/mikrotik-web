# 📡 Network Traffic Dashboard (Client)

This is the **frontend** of the Network Traffic Dashboard, built with **Next.js, TypeScript, Chakra UI, and Recharts**. It visualizes real-time network traffic data using **WebSockets**.

## 🚀 Features

- 📡 **Live WebSocket Data Streaming** - Real-time updates from the server.
- 📊 **Interactive Charts** - Uses `recharts` to visualize network traffic.
- 🎨 **Responsive UI** - Built with Shadcn/ui for a modern and adaptive design.
- ⚡ **TypeScript-Powered** - Ensures better type safety and maintainability.
- 🌐 **Multi-Interface Support** - Displays network data for multiple interfaces.

## 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, Shadcn/ui, Recharts
- **Backend:** [Network Traffic Dashboard API](https://github.com/KaivanKeren/mikrotik-api) (Express.js WebSocket Server)
- **Data Source:** Network traffic data (via API/WebSocket)

## 📸 Screenshots

![Dashboard Screenshot](/public/assets/image.png)

## 📦 Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/KaivanKeren/mikrotik-web.git
   cd mikrotik-web
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Run the application**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Connect to the WebSocket server**
   - Ensure the backend WebSocket server is running.

## 🔧 Configuration

Update the WebSocket server URL in `src/config.ts`:

```ts
export const WS_URL = "ws://localhost:9090";
```

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository, open issues, and submit pull requests. 🚀

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

🚀 **Happy Coding!** 🎉
