import UploadResume from "./components/UploadResume"

function App() {

return (

<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] text-white">

{/* Gradient mesh background */}

<div className="absolute inset-0 -z-10">

<div className="absolute w-[700px] h-[700px] bg-purple-600 rounded-full blur-[250px] opacity-30 animate-blob top-[-200px] left-[-200px]"></div>

<div className="absolute w-[700px] h-[700px] bg-indigo-600 rounded-full blur-[250px] opacity-30 animate-blob animation-delay-2000 bottom-[-200px] right-[-200px]"></div>

<div className="absolute w-[700px] h-[700px] bg-pink-600 rounded-full blur-[250px] opacity-30 animate-blob animation-delay-4000 top-[40%] left-[30%]"></div>

</div>

<UploadResume/>

</div>

)

}

export default App