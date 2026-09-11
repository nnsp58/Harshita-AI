import{c as e,n as t,t as n}from"./jsx-runtime-7vEuKfNK.js";import{t as r}from"./store-DOLk_ENJ.js";import{D as i,H as a,I as o,W as s,_ as c,g as l,i as u,p as d,rt as f,v as p,y as m}from"./index-DeqMw7Z5.js";var h=e(t(),1),g=n(),_=({initialContent:e=``,documentTitle:t=`Legal Document`,onChange:n})=>{let _=(0,h.useRef)(null),[v,y]=(0,h.useState)(12),{subscriptionMode:b}=r();h.useEffect(()=>{_.current&&e&&(_.current.innerHTML=e)},[e]);let x=(e,t=null)=>{document.execCommand(e,!1,t),_.current.focus(),n&&n(_.current.innerHTML)},S=e=>{y(e),document.execCommand(`fontSize`,!1,`7`),_.current.focus(),n&&n(_.current.innerHTML)};return(0,g.jsxs)(`div`,{className:`flex flex-col h-full bg-gray-100`,children:[(0,g.jsxs)(`div`,{className:`bg-white border-b border-gray-300 px-4 py-2 flex items-center gap-2 flex-wrap shadow-sm`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-1 border-r pr-3 mr-2`,children:[(0,g.jsx)(`button`,{onClick:()=>x(`bold`),className:`p-2 hover:bg-gray-100 rounded`,title:`Bold`,children:(0,g.jsx)(f,{size:16})}),(0,g.jsx)(`button`,{onClick:()=>x(`italic`),className:`p-2 hover:bg-gray-100 rounded`,title:`Italic`,children:(0,g.jsx)(o,{size:16})}),(0,g.jsx)(`button`,{onClick:()=>x(`underline`),className:`p-2 hover:bg-gray-100 rounded`,title:`Underline`,children:(0,g.jsx)(d,{size:16})})]}),(0,g.jsxs)(`div`,{className:`flex items-center gap-1 border-r pr-3 mr-2`,children:[(0,g.jsx)(`button`,{onClick:()=>x(`justifyLeft`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Left`,children:(0,g.jsx)(l,{size:16})}),(0,g.jsx)(`button`,{onClick:()=>x(`justifyCenter`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Center`,children:(0,g.jsx)(m,{size:16})}),(0,g.jsx)(`button`,{onClick:()=>x(`justifyRight`),className:`p-2 hover:bg-gray-100 rounded`,title:`Align Right`,children:(0,g.jsx)(p,{size:16})}),(0,g.jsx)(`button`,{onClick:()=>x(`justifyFull`),className:`p-2 hover:bg-gray-100 rounded`,title:`Justify`,children:(0,g.jsx)(c,{size:16})})]}),(0,g.jsx)(`div`,{className:`flex items-center gap-2 border-r pr-3 mr-2`,children:(0,g.jsx)(`select`,{value:v,onChange:e=>S(Number(e.target.value)),className:`border rounded px-2 py-1 text-sm`,children:[10,11,12,13,14,16,18,20].map(e=>(0,g.jsxs)(`option`,{value:e,children:[e,`pt`]},e))})}),(0,g.jsxs)(`div`,{className:`flex items-center gap-2 ml-auto`,children:[(0,g.jsxs)(`button`,{onClick:()=>{let e=window.open(``,`_blank`),n=_.current.innerHTML;e.document.write(`
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
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print(),e.close()},500)},className:`flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm`,children:[(0,g.jsx)(i,{size:16}),` Print`]}),(0,g.jsxs)(`button`,{onClick:()=>{let e=window.open(``,`_blank`),n=_.current.innerHTML;e.document.write(`
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
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print()},500)},className:`flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm`,children:[(0,g.jsx)(a,{size:16}),` Export PDF`]}),(0,g.jsxs)(`button`,{onClick:()=>{let e=_.current.innerText;navigator.clipboard.writeText(e).then(()=>{alert(`Document copied to clipboard!`)})},className:`flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm`,children:[(0,g.jsx)(s,{size:16}),` Copy`]})]})]}),(0,g.jsx)(`div`,{className:`flex-1 overflow-auto p-6 bg-gray-200 flex justify-center`,children:(0,g.jsxs)(`div`,{className:`bg-white shadow-2xl border border-gray-300`,style:{position:`relative`,width:`210mm`,minHeight:`297mm`,padding:`25mm`,fontFamily:`'Times New Roman', serif`,fontSize:`12pt`,lineHeight:`1.6`,color:`#000`,boxShadow:`0 0 15px rgba(0,0,0,0.15)`,overflow:`hidden`},children:[(0,g.jsx)(u,{}),(0,g.jsx)(`div`,{ref:_,contentEditable:!0,suppressContentEditableWarning:!0,className:`min-h-[200mm] outline-none legal-content relative z-10`,style:{whiteSpace:`pre-wrap`,textAlign:`justify`},onInput:e=>{n&&n(e.currentTarget.innerHTML)}})]})}),(0,g.jsxs)(`div`,{className:`bg-gray-800 text-gray-300 text-xs px-4 py-1 flex justify-between items-center`,children:[(0,g.jsx)(`div`,{children:`Page 1 of 1 • A4 • Legal Draft Mode`}),(0,g.jsx)(`div`,{children:`Ready • Auto-saved`})]})]})};export{_ as t};