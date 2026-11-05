"use client";

import React from "react";
import Link from "next/link";

export function AiSearchFooter() {
  return (
    <footer className="bx-ftr">
      <div>
        <span>© 2016–2026 Beetrix360®. All rights reserved.</span>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookie-policy">Cookie Policy</Link>
        <a className="push" href="tel:+14244416042">
          +1 (424) 441-6042
        </a>
      </div>
    </footer>
  );
}

