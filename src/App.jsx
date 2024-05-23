import { useEffect, useState } from "react"
import * as mammoth from 'mammoth'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronRight, faEllipsis } from "@fortawesome/free-solid-svg-icons"
function App() {
  const url = 'http://localhost:8080/api/v1/'
  const [text, setText] = useState("")
  const [encryptText, setEncryptText] = useState("")
  const [signature, setSignature] = useState({s1: "", s2:""})
  const [receivedText, setReceivedText] = useState("")
  const [receivedSignature, setReceivedSignature] = useState("")
  const [fileName, setFileName] = useState("Chọn tệp")
  const [fileName1, setFileName1] = useState("Chọn tệp")
  const [fileName2, setFileName2] = useState("Chọn tệp")
  const [secret, setSecret] = useState(null)
  const [secretContent, setSecretContent] = useState("")
  const [decryptedText, setDecryptedText] = useState("")
  const send = () => {
    if (encryptText.trim().length != 0){
      fetch(url + 'decrypt', 
      { headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
        method: 'POST',
        body: JSON.stringify({"text": encryptText, "secret_key": secret})
      }
    ).then(response => {
      return response.text()
    }).then(response => {
      setReceivedText(encryptText)
      setDecryptedText(response)
    })
    }
  }
  const downloadFile = () => {
    const link = document.createElement("a");
    const content = document.getElementById("encoded-text").value;
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "encoded-text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
 };
 const downloadFile2 = () => {
  const link = document.createElement("a");
  const content = document.getElementById("decoded-text").value;
  const file = new Blob([content], { type: 'text/plain' });
  link.href = URL.createObjectURL(file);
  link.download = "decoded-text.txt";
  link.click();
  URL.revokeObjectURL(link.href);
};
  const getSecret = () => {
    fetch(url + 'get-secret')
    .then(response => {
      return response.text()
    }).then(response => {
      setSecret(response)
      setSecretContent(response)
      console.log(response)
    })
  }
  const encode = () => {
    if (text.trim().length != 0){
      fetch(url + 'encrypt', 
      { headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
        method: 'POST',
        body: JSON.stringify({"text": text, "secret_key": secret})
      }
    ).then(response => {
      return response.text()
    }).then(response => {
      setEncryptText(response)
    })
    }
  }
  const decode = () => {
    if (receivedText.trim().length != 0){
      fetch(url + 'decrypt', 
      { headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
        method: 'POST',
        body: JSON.stringify({"text": receivedText, "secret_key": secret})
      }
    ).then(response => {
      return response.text()
    }).then(response => {
      setDecryptedText(response)
    })
    }
  }
  const extractDocxFile = (arrayBuffer) => {
    mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function(result){
      setText(result.value)
  }).catch(function(err){
      console.log(err);
  });
  }
  const extractDocxFile_ = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    fetch('http://localhost:8080/api/v1/get-html', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
      if (document.getElementById("text-container").children.length != 1){
        document.getElementById("text-container").removeChild(document.getElementById("text-container").children[1])
        document.getElementById("text").classList.remove("hidden")
        document.getElementById("text-container").classList.remove("p-[15px]")
      }
      const para = document.createElement("div");
      para.innerHTML = data
      document.getElementById('text-container').append(para)
      document.getElementById('text-container').classList.add("p-[15px]")
      document.getElementById('text').classList.add("hidden")
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
  }
  const expand = () => {
    const classList = document.getElementById('key-gen-dropdown').classList
    if (classList.contains('h-[200px]')){
      classList.replace('h-[200px]', 'h-[0px]')
      document.getElementById('key-gen-container').classList.replace('opacity-[1]', 'opacity-[0]')
    }
    else {
      classList.replace('h-[0px]', 'h-[200px]')
      setTimeout(()=> {
        document.getElementById('key-gen-container').classList.replace('opacity-[0]', 'opacity-[1]')
      }, 400)
    }
  }
  const reset = () => {
    setText("")
    setReceivedText("")
    setEncryptText("")
    setDecryptedText("")
    setFileName("Chọn tệp")
    if (document.getElementById("text-container").children.length != 1){
      document.getElementById("text-container").removeChild(document.getElementById("text-container").children[1])
      document.getElementById("text").classList.remove("hidden")
      document.getElementById("text-container").classList.remove("p-[15px]")
    }
  }
  useEffect(()=>{
    document.getElementById("file-picker").addEventListener('change', (event)=>{
      event.preventDefault()
      setDecryptedText("")
      setEncryptText("")
      setReceivedText("")
      const fr = new FileReader()
      const files = document.getElementById("file-picker").files
      const extension = files[0].name.split(".")[files[0].name.split(".").length - 1]
      if (extension === 'txt'){
        fr.onload = () => {
          setText(fr.result)
        }
        fr.readAsText(files[0])
        if (document.getElementById("text-container").children.length != 1){
          document.getElementById("text-container").removeChild(document.getElementById("text-container").children[1])
          document.getElementById("text").classList.remove("hidden")
          document.getElementById("text-container").classList.remove("p-[15px]")
        }
      }
      setFileName(files[0].name)
      
      //console.log(fr.readAsArrayBuffer(files[0]))
      if (extension === 'docx'){
        extractDocxFile_(files[0])
        fr.onload = () => {
          extractDocxFile(fr.result)
        }
        fr.readAsArrayBuffer(files[0])
      }
      setReceivedSignature("")
      setReceivedText("")
      setFileName1("Chọn tệp")
      setFileName2("Chọn tệp")
    })
    // document.getElementById("send").addEventListener('click', (event)=>{
    //   document.getElementById("received-text").textContent = text
    //   console.log("sent")
    // })
    document.getElementById("file-picker-receive").addEventListener('change', (event)=>{
      event.preventDefault()
      setDecryptedText("")
      const fr = new FileReader()
      const files = document.getElementById("file-picker-receive").files
      const extension = files[0].name.split(".")[files[0].name.split(".").length - 1]
      if (extension === 'txt'){
        fr.onload = () => {
          setReceivedText(fr.result)
        }
        fr.readAsText(files[0])
      }
      setFileName1(files[0].name)
      
      //console.log(fr.readAsArrayBuffer(files[0]))
    })
  }, [])
  return (
    <main className="w-full h-full flex flex-row p-5 bg-[white] relative">
      <div className="absolute top-[15px] w-[10px]">
        {/* <button className="text-[14px] bg-[#3a3835] text-white px-[15px] py-[2px]" onClick={()=>getKeyPair()}>Tạo khóa</button>
        {
          keyPair != null &&
        <div>
          <p>X = {keyPair.privateKey.x}</p>
          <p>P = {keyPair.publicKey.p}</p>
          <p>Alpha = {keyPair.publicKey.alpha}</p>
          <p>Y = {keyPair.publicKey.y}</p>
        </div>
        } */}
        <button className="px-[10px] rounded-full py-[5px] bg-green-500" onClick={()=>{expand()}}>
          <FontAwesomeIcon icon={faEllipsis} color="white">
          </FontAwesomeIcon>
        </button>
        <div className="absolute w-[200px] h-[0px] bg-white border-[1px] border-black mt-[2px] rounded-[5px] transition-all duration-[500ms]" id="key-gen-dropdown">
          <div className="opacity-[0] duration-200 transition-all w-full p-[15px] flex flex-col gap-[10px]" id="key-gen-container">
            <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px] inline-block" onClick={()=> {getSecret()}}>Sinh khóa</button>
            <ul className="flex flex-col gap-[10px]">
              <li className="flex flex-col gap-[10px] items-center">
                <span>Khóa bí mật: </span>
                <textarea name="" id="" className="flex h-[22px] border-[1px] rounded-[2px] resize-none px-[5px] text-[14px]" placeholder="N/A" readOnly value={secretContent}></textarea>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 p-10">
        <div className="h-full w-full flex flex-col gap-[10%]">
          <div className="flex flex-col flex-1 gap-[10%]">
            <p className="font-[500] text-[15px]">Bản rõ</p>
            <div className="flex flex-1 flex-col gap-[10%]">
              <div className="flex mb-10 bg-slate-100 rounded-[10px] h-[200px]" id="text-container">
                <textarea name="" id="text" onChange={(event)=>{setText(event.target.value)}} className="flex border-[1px] resize-none flex-[1] h-[200px] outline-none p-[15px]  border-black" value={text}></textarea>
              </div>
              <div className="flex flex-row justify-between">
                
                <input type="file" className="text-[14px] hidden" id="file-picker" accept=".txt, .docx"/>
                <div className="flex gap-[10px]">
                <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px]" onClick={()=>{encode()}}>Mã hóa</button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-[10%] pb-5">
            <p className="font-[500] text-[15px]">Bản mã</p>
            <div className="flex flex-1 gap-[10%]">
              <div className="flex mb-10">
                <textarea name="" id="encoded-text" className="flex border-[1px] resize-none flex-[1] h-[200px] outline-none p-[15px]  border-black" readOnly={true} value={encryptText}></textarea>
              </div>
              <div className="flex flex-col gap-[10%]">
                <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px]" id="send" onClick={() => {send()}}>Gửi</button>
                <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px]" onClick={() => {downloadFile()}}>Lưu</button>
              </div>
              </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 p-10 border-l-[1px] border-black">
      <div className="h-full w-full flex flex-col gap-[14.5%]">
          <div className="flex flex-col flex-1 gap-[10%]">
            <p className="font-[500] text-[15px]">Bản mã</p>
            <div className="flex flex-1 flex-col gap-[10%]">
              <div className="flex mb-10">
                <textarea name="" id="received-text" onChange={(event)=>{setReceivedText(event.target.value)}} className="flex border-[1px] resize-none flex-[1] h-[200px] outline-none p-[15px]  border-black" value={receivedText}></textarea>
              </div>
              <div className="flex flex-row justify-between">
                
                <input type="file" className="text-[14px] hidden" id="file-picker-receive" accept=".txt, .docx"/>
                <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px]" onClick={()=>{decode()}}>Giải mã</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-[10%] pb-[50px]">
            <p className="font-[500] text-[15px]">Bản rõ</p>
            <div className="flex flex-1 gap-[10%]">
              <div className="flex mb-10">
                <textarea name="" id="decoded-text" readOnly className="flex border-[1px] resize-none flex-[1] h-[200px] outline-none p-[15px]  border-black" value={decryptedText}></textarea>
              </div>
              <div className="gap-5 flex flex-col">
              <div className="flex flex-row justify-between">
              </div>
                <button className="text-[14px] bg-green-500 text-white px-[15px] py-[4px]" onClick={()=>{downloadFile2()}}>Lưu</button>
              </div>
              </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
