import React, { useState, useRef } from 'react';
import { Copy, Check, Image, FolderOpen, FileText, Quote, Upload, X } from 'lucide-react';

export default function App() {
  const [basePath, setBasePath] = useState('https://dersdeo.com/cinnamomo/wp-content/uploads/2025/10/');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [input, setInput] = useState('');
  const [blockquoteText, setBlockquoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      id: Math.random().toString(36)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatToElementorHTML = (text, photoFiles, path, quoteText) => {
    if (!text.trim()) return '';

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return '';

    const title = lines[0] || '';
    const subtitle = lines.length > 1 ? lines[1] : '';
    let contentLines = lines.slice(2);

    const photoArray = photoFiles.map(f => f.name);

    if (quoteText.trim()) {
      const quoteKeyword = quoteText.trim().toLowerCase();
      contentLines = contentLines.map(line => {
        if (line.toLowerCase().includes(quoteKeyword)) {
          return '> ' + line.replace(/^>\s*/, '');
        }
        return line;
      });
    }

    let html = `<!-- Elementor HTML widget: Auto article format + image placement + gallery -->
<style>
  .article-wrap{max-width:800px;margin:0 auto;line-height:1.8;font-size:16px;color:#333;padding:18px;box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial;}
  .article-wrap h1{font-size:28px;margin:0 0 8px;}
  .article-sub{margin:0 0 20px;font-style:italic;color:#444;}
  .article-wrap p{margin:0 0 20px;}
  blockquote.custom{margin:18px 0;padding:10px 16px;border-left:4px solid #000;background:rgba(0,0,0,0.02);}
  figure.inline{margin:14px 0 19px 0;}
  figure.inline img{width:100%;height:auto;display:block;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
  figcaption{font-size:0.9rem;color:#555;margin-top:6px;}
  .photo-row-double{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:14px 0 19px 0;}
  .photo-row-double img{width:100%;height:auto;display:block;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
  .photo-row-triple{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin:14px 0 19px 0;}
  .photo-row-triple img{width:100%;height:auto;display:block;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
  .photo-single{margin:14px 0 19px 0;}
  .photo-single img{width:100%;height:auto;display:block;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
  .gallery-title{margin-top:18px;font-size:1.05rem;}
  .two-col-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-top:8px;}
  .two-col-gallery img{width:100%;height:auto;display:block;border-radius:6px;}
  @media(max-width:600px){ .photo-row-double{grid-template-columns:1fr;} .photo-row-triple{grid-template-columns:1fr;} .two-col-gallery{grid-template-columns:1fr;} .article-wrap{padding:12px;font-size:15px;} .article-wrap h1{font-size:22px;} }
</style>

<div class="article-wrap" id="article-root">
  <h1>${title}</h1>
  <p class="article-sub">${subtitle}</p>

  <div id="article-content">
`;

    contentLines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const paraId = `paragraph-${index + 1}`;

      if (trimmed.startsWith('>')) {
        const quote = trimmed.substring(1).trim();
        html += `    <blockquote class="custom">${formatInlineStyles(quote)}</blockquote>\n`;
      } else {
        html += `    <p id="${paraId}">${formatInlineStyles(trimmed)}</p>\n`;
      }
    });

    html += `  </div>

  <div id="end-gallery" aria-label="Article gallery">
    <h3 class="gallery-title" style="display:none;">Gallery</h3>
    <div class="two-col-gallery" id="gallery-grid"></div>
  </div>
</div>

<script>
(function(){
  const basePath = "${path}";
  const files = ${JSON.stringify(photoArray)};

  const placements = {};
  const altMap = {};
  const captionMap = {};

  const content = document.getElementById("article-content");
  const ps = content.querySelectorAll("p");
  
  ps.forEach((p,i)=>{ if(!p.id) p.id = "paragraph-" + (i+1); });

  const placed = new Set();
  Object.keys(placements).forEach(fname=>{
    const paraId = placements[fname];
    const target = document.getElementById(paraId);
    if(target){
      target.insertAdjacentElement('afterend', makeFigure(fname));
      placed.add(fname);
    }
  });

  const remaining = files.filter(f => !placed.has(f));
  const paragraphCount = ps.length || 1;
  const totalPhotos = remaining.length;
  const isEven = totalPhotos % 2 === 0;
  
  if(isEven && totalPhotos > 4){
    for(let i = 0; i < remaining.length; i += 2){
      const targetIndex = Math.min((((i/2)*2) % paragraphCount) + 1, paragraphCount);
      const target = document.getElementById("paragraph-" + targetIndex);
      if(target){
        const photoRow = makePhotoRow([remaining[i], remaining[i+1]]);
        target.insertAdjacentElement('afterend', photoRow);
        placed.add(remaining[i]);
        if(remaining[i+1]) placed.add(remaining[i+1]);
      }
    }
  } else if(!isEven && totalPhotos > 5){
    const first5 = remaining.slice(0, 5);
    const middle = remaining.slice(5, totalPhotos - 3);
    const last3 = remaining.slice(totalPhotos - 3);
    
    first5.forEach((f,i)=>{
      const targetIndex = Math.min(((i*2) % paragraphCount) + 1, paragraphCount);
      const target = document.getElementById("paragraph-" + targetIndex);
      if(target){
        target.insertAdjacentElement('afterend', makePhotoSingle(f));
        placed.add(f);
      }
    });
    
    for(let i = 0; i < middle.length; i += 2){
      const targetIndex = Math.min((((i/2 + 5)*2) % paragraphCount) + 1, paragraphCount);
      const target = document.getElementById("paragraph-" + targetIndex);
      if(target && middle[i]){
        const photoRow = makePhotoRow([middle[i], middle[i+1]]);
        target.insertAdjacentElement('afterend', photoRow);
        placed.add(middle[i]);
        if(middle[i+1]) placed.add(middle[i+1]);
      }
    }
    
    if(last3.length === 3){
      const targetIndex = Math.min(paragraphCount, paragraphCount);
      const target = document.getElementById("paragraph-" + targetIndex);
      if(target){
        const photoRow = makePhotoRowTriple(last3);
        target.insertAdjacentElement('afterend', photoRow);
        last3.forEach(f => placed.add(f));
      }
    }
  } else {
    remaining.forEach((f,i)=>{
      const targetIndex = Math.min(((i*2) % paragraphCount) + 1, paragraphCount);
      const target = document.getElementById("paragraph-" + targetIndex);
      if(target){
        target.insertAdjacentElement('afterend', makePhotoSingle(f));
        placed.add(f);
      }
    });
  }

  const galleryGrid = document.getElementById("gallery-grid");
  let galleryCount = 0;
  const galleryPhotos = files.filter(f => !placed.has(f));
  
  const galleryIsEven = galleryPhotos.length % 2 === 0;
  
  galleryPhotos.forEach(f=>{
    const img = document.createElement('img');
    img.src = basePath + f;
    img.loading = "lazy";
    img.alt = altMap[f] || autoAlt(f);
    galleryGrid.appendChild(img);
    galleryCount++;
  });
  
  if(galleryCount > 0){
    document.querySelector(".gallery-title").style.display = "block";
    if(!galleryIsEven){
      galleryGrid.style.gridTemplateColumns = "1fr";
    }
  }

  function makePhotoRow(filenames){
    const row = document.createElement('div');
    row.className = 'photo-row-double';
    filenames.forEach(fn => {
      if(fn){
        const img = document.createElement('img');
        img.src = basePath + fn;
        img.loading = 'lazy';
        img.alt = altMap[fn] || autoAlt(fn);
        row.appendChild(img);
      }
    });
    return row;
  }

  function makePhotoRowTriple(filenames){
    const row = document.createElement('div');
    row.className = 'photo-row-triple';
    filenames.forEach(fn => {
      if(fn){
        const img = document.createElement('img');
        img.src = basePath + fn;
        img.loading = 'lazy';
        img.alt = altMap[fn] || autoAlt(fn);
        row.appendChild(img);
      }
    });
    return row;
  }

  function makePhotoSingle(filename){
    const div = document.createElement('div');
    div.className = 'photo-single';
    const img = document.createElement('img');
    img.src = basePath + filename;
    img.loading = 'lazy';
    img.alt = altMap[filename] || autoAlt(filename);
    div.appendChild(img);
    return div;
  }

  function makeFigure(filename){
    const fig = document.createElement('figure');
    fig.className = "inline";
    const img = document.createElement('img');
    img.src = basePath + filename;
    img.loading = "lazy";
    img.alt = altMap[filename] || autoAlt(filename);
    fig.appendChild(img);
    if(captionMap[filename]){
      const cap = document.createElement('figcaption');
      cap.textContent = captionMap[filename];
      fig.appendChild(cap);
    }
    return fig;
  }

  function autoAlt(fn){
    return fn.replace(/[-_]/g,' ').replace(/\\.[^/.]+$/,'');
  }

})();
</script>`;

    return html;
  };

  const formatInlineStyles = (text) => {
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return text;
  };

  const formattedHTML = formatToElementorHTML(input, uploadedFiles, basePath, blockquoteText);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    setBasePath('https://dersdeo.com/cinnamomo/wp-content/uploads/2025/10/');
    setUploadedFiles([
      { name: 'paulista-1.jpg', id: '1' },
      { name: 'veridiana-pizza-2.jpg', id: '2' },
      { name: 'jardins-3.jpg', id: '3' },
      { name: 'masp-4.jpg', id: '4' },
      { name: 'bardi-5.jpg', id: '5' },
      { name: 'architecture-6.jpg', id: '6' }
    ]);
    setInput(`Paulista! Everything ends in pizza
Pizzeria Veridiana, Jardins district, São Paulo
"Everything ends in pizza!", just as for Italians everything is solved with tarallucci and wine, the waiter at Veridiana explains to me. Dining in São Paulo means rediscovering the flavors of the Italians who "came to make America."
Veridiana is more than a simple pizzeria. I have been staying in the Jardins neighborhood, a very chic urban district where skyscrapers were built in a luxuriant, leafy setting.
Linear time is an invention of the West: time is not linear, it is a marvelous overlapping.
Words by Lina Bo Bardi, who became the architect of the MASP. She completed it in 1968 with the intention of imposing a horizontal surprise.
**And then, in the end, we are all paulistas!**`);
    setBlockquoteText('Linear time is an invention');
  };

  const StepCard = ({ number, title, icon: Icon, children, isActive }) => (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: isActive ? '0 8px 24px rgba(255, 140, 66, 0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
      border: isActive ? '2px solid #ff8c42' : '2px solid transparent',
      transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          fontFamily: 'Poppins, sans-serif'
        }}>
          {number}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
            <Icon size={20} />
            {title}
          </h3>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#ffe6cf', padding: '24px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#2d3748', fontSize: '40px', marginBottom: '12px', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }}>
            📝 Elementor Blog Formatter
          </h1>
          <p style={{ color: '#4a5568', fontSize: '18px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: '400' }}>
            Upload photos, paste text, generate perfect HTML automatically!
          </p>
          <button
            onClick={loadExample}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🎯 Load Example & Test
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <StepCard number="1" title="Photo Folder Path" icon={FolderOpen} isActive={!basePath}>
              <label style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                WordPress media folder path (same as uploaded photos):
              </label>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="https://yoursite.com/wp-content/uploads/2025/10/"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  transition: 'border 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff8c42'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </StepCard>

            <StepCard number="2" title="Upload Photos" icon={Upload} isActive={basePath && uploadedFiles.length === 0}>
              <label style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                Select photos you uploaded to WordPress:
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <Upload size={20} />
                Click to Select Photos
              </button>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto', background: '#f7fafc', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                    📁 {uploadedFiles.length} photo{uploadedFiles.length > 1 ? 's' : ''} selected:
                  </div>
                  {uploadedFiles.map(file => (
                    <div key={file.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px',
                      background: 'white',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}>
                      <span style={{ color: '#4a5568', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(file.id)}
                        style={{
                          background: '#fee',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: '#e53e3e',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#718096', fontFamily: 'Poppins, sans-serif' }}>
                💡 Program automatically extracts filenames - no typing errors!
              </div>
            </StepCard>

            <StepCard number="3" title="Article Content" icon={FileText} isActive={uploadedFiles.length > 0 && !input}>
              <label style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                Paste your text (line 1: Title, line 2: Subtitle):
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Title goes here&#10;Subtitle or location info&#10;&#10;First paragraph...&#10;&#10;Second paragraph...&#10;&#10;*italic* **bold**"
                style={{
                  width: '100%',
                  height: '240px',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'system-ui',
                  resize: 'vertical',
                  lineHeight: '1.6',
                  transition: 'border 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff8c42'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </StepCard>

            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '20px',
              border: '2px dashed #cbd5e0'
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
                <Quote size={18} />
                Add Quote (Optional)
              </h3>
              <label style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                Write a keyword from the sentence you want to quote:
              </label>
              <input
                type="text"
                value={blockquoteText}
                onChange={(e) => setBlockquoteText(e.target.value)}
                placeholder="e.g., Linear time"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'border 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff8c42'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#718096', fontStyle: 'italic', fontFamily: 'Poppins, sans-serif' }}>
                Paragraph containing this keyword will auto-convert to blockquote
              </div>
            </div>

          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            position: 'sticky',
            top: '24px',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#2d3748', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }}>
                ⚡ Elementor HTML Code
              </h2>
              <button
                onClick={copyToClipboard}
                disabled={!formattedHTML}
                style={{
                  padding: '12px 24px',
                  background: copied ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: formattedHTML ? 'pointer' : 'not-allowed',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  opacity: formattedHTML ? 1 : 0.5,
                  boxShadow: copied ? '0 4px 12px rgba(72, 187, 120, 0.3)' : '0 4px 12px rgba(255, 140, 66, 0.3)',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>
            <div
              style={{
                flex: 1,
                padding: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                overflow: 'auto',
                background: '#f7fafc',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                lineHeight: '1.5'
              }}
            >
              {formattedHTML || (
                <div style={{ color: '#a0aec0', textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
                  <div style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: '500' }}>HTML code will appear here...</div>
                  <div style={{ fontSize: '14px', marginTop: '8px', fontFamily: 'Poppins, sans-serif' }}>Complete the steps on the left</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '28px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '20px', color: '#2d3748', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>💡 Quick Tips</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#fff5f0', borderRadius: '12px', borderLeft: '4px solid #ff8c42' }}>
              <strong style={{ color: '#ff6b35', fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}>Auto Filenames:</strong>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#4a5568', fontFamily: 'Poppins, sans-serif', lineHeight: '1.6' }}>
                Upload photos and names are extracted automatically - zero typing errors!
              </p>
            </div>
            <div style={{ padding: '16px', background: '#fef5e7', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#d97706', fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}>Smart Layout:</strong>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#4a5568', fontFamily: 'Poppins, sans-serif', lineHeight: '1.6' }}>
                Even &amp; 4+: 2 cols | Odd &amp; 5+: intelligent distribution
              </p>
            </div>
            <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: '12px', borderLeft: '4px solid #9333ea' }}>
              <strong style={{ color: '#7e22ce', fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}>One Click:</strong>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#4a5568', fontFamily: 'Poppins, sans-serif', lineHeight: '1.6' }}>
                Copy HTML and paste directly into Elementor HTML widget
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '24px', color: '#2d3748', fontFamily: 'Poppins, sans-serif', fontWeight: '700', textAlign: 'center' }}>
            📚 Complete WordPress + Elementor Guide
          </h3>

          <div style={{ marginBottom: '32px', padding: '24px', background: '#f7fafc', borderRadius: '12px', borderLeft: '4px solid #ff8c42' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '20px', color: '#ff6b35', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>
              📸 PART A: Upload Photos to WordPress
            </h4>
            
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ margin: '0 0 12px', fontSize: '16px', color: '#2d3748', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
                Step 1: Access Media Library
              </h5>
              <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
                <li>WordPress admin → <strong>"Media"</strong> → <strong>"Library"</strong> → <strong>"Add New"</strong></li>
              </ol>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ margin: '0 0 12px', fontSize: '16px', color: '#2d3748', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
                Step 2: Upload Photos
              </h5>
              <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
                <li>Select/drag photos → Wait for upload</li>
                <li><strong>Keep the same files</strong> to upload to this tool!</li>
              </ol>
            </div>

            <div>
              <h5 style={{ margin: '0 0 12px', fontSize: '16px', color: '#2d3748', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
                Step 3: Copy Folder Path
              </h5>
              <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
                <li>Click any photo → Find "File URL"</li>
                <li>Copy URL, <strong>remove filename</strong></li>
                <li style={{ background: '#fff', padding: '8px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', marginTop: '8px' }}>
                  ✅ https://site.com/wp-content/uploads/2025/10/
                </li>
              </ol>
            </div>
          </div>

          <div style={{ marginBottom: '32px', padding: '24px', background: '#f7fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '20px', color: '#d97706', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>
              🎯 PART B: Use This Tool
            </h4>
            <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
              <li><strong>Step 1:</strong> Paste folder path from WordPress</li>
              <li><strong>Step 2:</strong> Upload THE SAME photos (program extracts names automatically!)</li>
              <li><strong>Step 3:</strong> Paste article text</li>
              <li><strong>Optional:</strong> Add blockquote keyword</li>
              <li><strong>Copy HTML</strong> - Ready to use! 🎉</li>
            </ol>
          </div>

          <div style={{ marginBottom: '32px', padding: '24px', background: '#f7fafc', borderRadius: '12px', borderLeft: '4px solid #9333ea' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '20px', color: '#7e22ce', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>
              📝 PART C: Create WordPress Post
            </h4>
            <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
              <li><strong>"Posts"</strong> → <strong>"Add New"</strong> → Enter title</li>
              <li><strong>Language (Polylang):</strong> Select ⚠️ Don't forget!</li>
              <li><strong>Category:</strong> Choose</li>
              <li><strong>Featured Image:</strong> Select from photos</li>
              <li>Click <strong>"Publish"</strong></li>
            </ol>
          </div>

          <div style={{ padding: '24px', background: '#f7fafc', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '20px', color: '#2563eb', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>
              🎨 PART D: Elementor
            </h4>
            <ol style={{ margin: 0, paddingLeft: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>
              <li>Click <strong>"Edit with Elementor"</strong></li>
              <li>Search <strong>"HTML"</strong> widget</li>
              <li><strong>Drag HTML widget</strong> to page</li>
              <li><strong>Delete</strong> default code</li>
              <li><strong>Paste</strong> generated HTML</li>
              <li>Click <strong>"Update"</strong> → Done! 🎉</li>
            </ol>
          </div>

          <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: '18px', fontFamily: 'Poppins, sans-serif', fontWeight: '700' }}>
              🎯 Quick Summary
            </h5>
            <p style={{ margin: 0, fontSize: '14px', fontFamily: 'Poppins, sans-serif', lineHeight: '1.6' }}>
              Upload to WordPress → Copy path → Upload here (auto names!) → Paste text → Copy HTML → Elementor → Done! ✅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
