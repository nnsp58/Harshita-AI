import{o as e}from"./rolldown-runtime-DAXXjFlN.js";import{n as t,t as n}from"./jsx-runtime-qcxWs1lu.js";import{a as r,i,n as a,o,r as s,s as c,t as l}from"./underline-qGZo2DOH.js";import{t as u}from"./copy-Da_dmhh5.js";import{t as d}from"./download-Ch0y8Ga-.js";import{t as f}from"./printer-CV1wyrSy.js";var p=e(t(),1),m=n(),h=({initialContent:e=``,documentTitle:t=`Legal Document`,onChange:n})=>{let h=(0,p.useRef)(null),[g,_]=(0,p.useState)(12);p.useEffect(()=>{h.current&&e&&(h.current.innerHTML=e)},[e]);let v=(e,t=null)=>{document.execCommand(e,!1,t),h.current.focus(),n&&n(h.current.innerHTML)},y=e=>{_(e),document.execCommand(`fontSize`,!1,`7`),h.current.focus(),n&&n(h.current.innerHTML)};return(0,m.jsxs)(`div`,{className:`flex flex-col h-full bg-gray-100`,children:[(0,m.jsxs)(`div`,{className:`bg-white border-b border-gray-300 px-4 py-2 flex items-center gap-2 flex-wrap shadow-sm`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-1 border-r pr-3 mr-2`,children:[(0,m.jsx)(`button`,{onClick:()=>v(`bold`),className:`p-2 hover:bg-gray-100 rounded`,title:`Bold`,children:(0,m.jsx)(c,{size:16})}),(0,m.jsx)(`button`,{onClick:()=>v(`italic`),className:`p-2 hover:bg-gray-100 rounded`,title:`Italic`,children:(0,m.jsx)(o,{size:16})}),(0,m.jsx)(`button`,{onClick:()=>v(`underline`),className:`p-2 hover:bg-gray-100 rounded`,title:`Underline`,children:(0,m.jsx)(l,{size:16})})]}),(0,m.jsxs)(`div`,{className:`flex items-center gap-1 border-r pr-3 mr-2`,children:[(0,m.jsx)(`button`,{onClick:()=>v(`justifyLeft`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Left`,children:(0,m.jsx)(a,{size:16})}),(0,m.jsx)(`button`,{onClick:()=>v(`justifyCenter`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Center`,children:(0,m.jsx)(r,{size:16})}),(0,m.jsx)(`button`,{onClick:()=>v(`justifyRight`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Right`,children:(0,m.jsx)(i,{size:16})}),(0,m.jsx)(`button`,{onClick:()=>v(`justifyFull`),className:`p-2 hover:bg-gray-100 rounded`,title:`Justify`,children:(0,m.jsx)(s,{size:16})})]}),(0,m.jsx)(`div`,{className:`flex items-center gap-2 border-r pr-3 mr-2`,children:(0,m.jsx)(`select`,{value:g,onChange:e=>y(Number(e.target.value)),className:`border rounded px-2 py-1 text-sm`,children:[10,11,12,13,14,16,18,20].map(e=>(0,m.jsxs)(`option`,{value:e,children:[e,`pt`]},e))})}),(0,m.jsxs)(`div`,{className:`flex items-center gap-2 ml-auto`,children:[(0,m.jsxs)(`button`,{onClick:()=>{let e=window.open(``,`_blank`),n=h.current.innerHTML;e.document.write(`
      <html>
        <head>
          <title>${t}</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: white;
              margin: 0;
              padding: 0;
            }
            .legal-document {
              max-width: 100%;
              margin: 0 auto;
              text-align: justify;
              white-space: pre-wrap;
            }
            h1, h2, h3 { text-align: center; margin-bottom: 20px; }
            .parties { margin: 20px 0; }
            .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="legal-document">
            ${n}
          </div>
        </body>
      </html>
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print(),e.close()},500)},className:`flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm`,children:[(0,m.jsx)(f,{size:16}),` Print`]}),(0,m.jsxs)(`button`,{onClick:()=>{let e=window.open(``,`_blank`),n=h.current.innerHTML;e.document.write(`
      <html>
        <head>
          <title>${t}</title>
          <style>
            @page { size: A4; margin: 1.5cm; }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: white;
              margin: 0;
              padding: 0;
            }
            .legal-document { 
              max-width: 100%; 
              text-align: justify;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="legal-document">
            ${n}
          </div>
        </body>
      </html>
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print()},500)},className:`flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm`,children:[(0,m.jsx)(d,{size:16}),` Export PDF`]}),(0,m.jsxs)(`button`,{onClick:()=>{let e=h.current.innerText;navigator.clipboard.writeText(e).then(()=>{alert(`Document copied to clipboard!`)})},className:`flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm`,children:[(0,m.jsx)(u,{size:16}),` Copy`]})]})]}),(0,m.jsx)(`div`,{className:`flex-1 overflow-auto p-6 bg-gray-200 flex justify-center`,children:(0,m.jsx)(`div`,{className:`bg-white shadow-2xl border border-gray-300`,style:{width:`210mm`,minHeight:`297mm`,padding:`25mm`,fontFamily:`'Times New Roman', serif`,fontSize:`12pt`,lineHeight:`1.6`,color:`#000`,boxShadow:`0 0 15px rgba(0,0,0,0.15)`},children:(0,m.jsx)(`div`,{ref:h,contentEditable:!0,suppressContentEditableWarning:!0,className:`min-h-[200mm] outline-none legal-content`,style:{whiteSpace:`pre-wrap`,textAlign:`justify`},onInput:e=>{n&&n(e.currentTarget.innerHTML)}})})}),(0,m.jsxs)(`div`,{className:`bg-gray-800 text-gray-300 text-xs px-4 py-1 flex justify-between items-center`,children:[(0,m.jsx)(`div`,{children:`Page 1 of 1 • A4 • Legal Draft Mode`}),(0,m.jsx)(`div`,{children:`Ready • Auto-saved`})]})]})};export{h as t};