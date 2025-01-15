"use client"

import * as React from "react"
import {ThemeProvider, ThemeProvider as NextThemesProvider} from "next-themes"
import {Inter} from "next/font/google";
import {Metadata} from "next";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Language System',
    description: 'Manage language entries for your application',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    )
}