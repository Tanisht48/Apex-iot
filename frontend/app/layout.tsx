'use client';
import './globals.css';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/Theme-provider';
import Provider from '@/lib/services/Provider';
import { Toaster } from '@/components/ui/toaster';

const Navbar = dynamic(() =>
  import('@/components/customComponents/Navbar').then((mod) => mod.Navbar)
);

import React, { useEffect } from 'react';
import Head from 'next/head';
import { isTokenValid } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isTokenValid() && ( pathname =='/' || pathname !== '/login')) {
      router.push('/login');
    }
    else if(isTokenValid() && pathname=='/')
    {
      router.push('/organisations')
      
    }
  }, [router, pathname]);

  if (pathname === '/login') {
    return (
      <html lang="en">
        <Head>
          <title>Apex IoT - Security & Device Monitoring</title>
        </Head>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <Head>
        <title>Apex IoT - Security & Device Monitoring</title>
        <meta name="description" content="IoT security and device monitoring dashboard" />
      </Head>
      <body>
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col gap-0 h-full bg-background dark:bg-background">
              <Navbar />
              <div className="w-full h-full bg-background dark:bg-background">
                <main>{children}</main>
                <Toaster />
              </div>
            </div>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
