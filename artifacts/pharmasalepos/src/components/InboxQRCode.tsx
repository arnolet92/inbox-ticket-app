import React from "react";
import { QRCodeSVG } from "qrcode.react";

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="16" viewBox="0 0 60 16">
  <text x="30" y="13" font-family="'Inter',ui-sans-serif,system-ui,sans-serif" font-size="13" font-weight="900" fill="#14532d" text-anchor="middle" letter-spacing="2">INBOX</text>
</svg>`;

const LOGO_URL = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

interface InboxQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  className?: string;
}

export function InboxQRCode({ value, size = 200, fgColor = "#14532d", className }: InboxQRCodeProps) {
  const logoW = Math.round(size * 0.30);
  const logoH = Math.round(logoW * (16 / 60));
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
