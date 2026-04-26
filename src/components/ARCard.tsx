import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

export default function ARCard() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR code pointing to the ar.html
    const currentUrl = window.location.href.replace(/\/$/, ''); // Remove trailing slash
    const arUrl = `${currentUrl}/ar.html`;

    QRCode.toDataURL(arUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#00f0ff',
        light: '#02040a'
      }
    }).then(url => setQrCodeUrl(url)).catch(err => console.error(err));
  }, []);

  return (
    <div className="ar-card-container glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
      <h3 style={{ margin: 0, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '2px' }}>Scan for AR Business Card</h3>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="AR Business Card QR Code" style={{ border: '2px solid #00f0ff', borderRadius: '10px' }} />
      ) : (
        <div style={{ width: '200px', height: '200px', border: '2px solid #00f0ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
          Generating...
        </div>
      )}
      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
        Point your phone camera at this code,<br/>then point it at a Hiro marker to view.
      </p>
    </div>
  );
}
