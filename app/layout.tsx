import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'描描｜相機描圖',description:'開啟手機相機，疊上你的參考圖片，享受在紙上慢慢描繪。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><body>{children}</body></html>}
