import React from "react";
import { QRCodeSVG } from "qrcode.react";

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="28" viewBox="0 0 64 28">
  <rect width="64" height="28" rx="5" fill="#0a0f0b"/>
  <text x="32" y="20" font-family="'Inter',ui-sans-serif,system-ui,sans-serif" font-size="12" font-weight="800" fill="#22c55e" text-anchor="middle" letter-spacing="1.5">INBOX</text>
</svg>`;

const LOGO_URL = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

interface InboxQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  className?: string;
}

export function InboxQRCode({ value, size = 200, fgColor = "#14532d", className }: InboxQRCodeProps) {
  const logoW = Math.round(size * 0.31);
  const logoH = Math.round(logoW * (28 / 64));
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      fgColor={fgColor}
      className={className}
      imageSettings={{
        src: LOGO_URL,
        width: logoW,
        height: logoH,
        excavate: true,
      }}
    />
  );
}
