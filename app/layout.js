export const metadata = {
  title: 'AI Gateway Access Portal',
  description: 'Generate your free OmniRoute API Key',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#111827' }}>
        {children}
      </body>
    </html>
  );
}
