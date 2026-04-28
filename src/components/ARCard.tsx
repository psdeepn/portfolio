import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ARCard() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Generate QR code pointing to the ar.html
    // Use origin + pathname base to construct a clean URL
    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/[^/]*$/, ''); // remove trailing filename if any
    const arUrl = `${origin}${basePath}/ar.html`.replace(/\/\//g, '/').replace(':/', '://');

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
    <div className="ar-card-container glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '30px', maxWidth: '320px', margin: '30px auto 0' }}>
      <h3 style={{ margin: 0, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Scan for AR Business Card</h3>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="AR Business Card QR Code" style={{ border: '2px solid #00f0ff', borderRadius: '10px', width: '200px', height: '200px' }} />
      ) : (
        <div style={{ width: '200px', height: '200px', border: '2px solid #00f0ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
          Generating...
        </div>
      )}
      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
        Scan this QR code with your phone camera.<br/>
        It will open the AR experience — point your<br/>
        camera at a <strong style={{ color: '#f5c051' }}>Hiro marker</strong> to view the 3D card.
      </p>
      <a 
        href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          fontSize: '12px', 
          color: '#00f0ff', 
          textDecoration: 'underline',
          opacity: 0.7 
        }}
      >
        Download Hiro Marker
      </a>
    </div>
  );
}
