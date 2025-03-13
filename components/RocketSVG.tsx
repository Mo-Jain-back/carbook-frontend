'use client'

import * as React from "react"
import { motion } from "framer-motion";
interface Props {
    className?: string,
}

const PATH = ["M71 283V298",
    "M87.3704 278V293",
    "M87.3704 307V322",
    "M96.1851 311V326",
    "M79.8149 316V331",
    "M105 295V310",
    "M105 318V333",
    "M96.1851 278V303",
    "M71 308V322",
    "M79.8149 284V309",
]

 const Rocket = (props:Props) => (
    <svg
    viewBox="0 0 172 335"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Thrust">
      {PATH.map((path,index) =>(
        <motion.path
          id="Vector"
          key={index}
          d={path}
          strokeWidth={4}
          strokeLinecap="round"
          animate={{ y: [-30,100],opacity: [0.8,0] }}
          transition= {{
            duration: 0.5+index/PATH.length,
            repeat: Infinity,
          }}
        />
        ))}
      </g>
    <g id="Rocket">
      <motion.g
          id="Ship"
          animate={{ y: [15, 0, 15] }}
          strokeWidth={2}
          stroke={"black"}
          transition= {{
            times:[0,1],
            duration:5,
            repeat:Infinity,
            type:"keyframes",
            ease:"easeInOut"
          }}
          >
        <path id="Top" d="M113.798 65.3831C112.104 59.3185 107.452 43.1728 102.005 28.5385C99.2829 21.2242 96.3545 14.2677 93.4896 9.13256C92.0582 6.56701 90.6304 4.43344 89.2376 2.93466C87.862 1.45449 86.4343 0.5 85 0.5C83.5656 0.5 82.138 1.45449 80.7624 2.93466C79.3696 4.43344 77.9418 6.56701 76.5104 9.13256C73.6455 14.2677 70.7171 21.2242 67.9946 28.5385C62.5476 43.1728 57.8965 59.3185 56.2023 65.3831C55.7552 66.9833 56.9768 68.5 58.6081 68.5H111.392C113.023 68.5 114.245 66.9833 113.798 65.3831Z"/>
        <g id="Body">
          <path id="Rectangle 20" d="M56 192.459H55.5V192.959V252C55.5 253.381 56.6193 254.5 58 254.5H112C113.381 254.5 114.5 253.381 114.5 252V192.959V192.459H114H56Z"/>
          <rect id="Rectangle 21" x="55.5" y="130.48" width="59" height="62.0406"/>
          <path id="Rectangle 22" d="M114 130.541H114.5V130.041V71C114.5 69.6193 113.381 68.5 112 68.5H58C56.6193 68.5 55.5 69.6193 55.5 71V130.041V130.541H56H114Z"/>
        </g>
          <path id="Bottom" d="M58.1517 254.5C56.3191 254.5 55.1094 256.406 55.8896 258.064L62.0073 271.064C62.4196 271.941 63.3009 272.5 64.2693 272.5H107.124C108.16 272.5 109.089 271.861 109.459 270.893L114.429 257.893C115.055 256.256 113.847 254.5 112.094 254.5H58.1517Z"/>
          <path id="Wing 1" d="M51.8398 212.143C53.5041 211.233 55.5 212.45 55.5 214.331V252.381C55.5 253.498 54.7593 254.479 53.6854 254.785L4.39366 268.838C2.91838 269.258 1.40306 268.258 1.30597 266.695C1.02984 262.249 0.865948 252.271 4.19443 244.912C4.69194 243.812 5.66934 242.576 6.97221 241.258C8.28242 239.933 9.95295 238.493 11.8738 236.988C15.7159 233.976 20.5901 230.676 25.6577 227.462C35.7947 221.034 46.7422 214.93 51.8398 212.143Z"/>
          <path id="Wing 3" d="M118.16 212.143C116.496 211.233 114.5 212.45 114.5 214.331V252.381C114.5 253.498 115.241 254.479 116.315 254.785L165.606 268.838C167.082 269.258 168.597 268.258 168.694 266.695C168.97 262.249 169.134 252.271 165.806 244.912C165.308 243.812 164.331 242.576 163.028 241.258C161.718 239.933 160.047 238.493 158.126 236.988C154.284 233.976 149.41 230.676 144.342 227.462C134.205 221.034 123.258 214.93 118.16 212.143Z"/>
      </motion.g>
    </g>
  </svg>
)
export default Rocket;



// const SvgComponent = (props:any) => (
//   <svg
//     width={172}
//     height={335}
//     viewBox="0 0 172 335"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <g id="Rocket">
//       <g id="Ship">
//           <path
//             id="Top"
//             d="M87.3658 4.21699L114.572 64.1298C115.023 65.1229 114.297 66.25 113.206 66.25H58.7938C57.7032 66.25 56.9771 65.1229 57.4281 64.1298L84.6342 4.21698C85.1669 3.04391 86.8331 3.04391 87.3658 4.21699Z"
//            
//           />
//           <g id="Body">
//             <rect
//               id="Rectangle 1"
//               x={56.5}
//               y={195.5}
//               width={59}
//               height={60}
//               rx={1.5}
//              
//             />
//             <rect
//               id="Rectangle 5"
//               x={56.5}
//               y={132.5}
//               width={59}
//               height={60}
//               rx={1.5}
//              
//             />
//             <rect
//               id="Rectangle 6"
//               x={56.5}
//               y={69.5}
//               width={59}
//               height={60}
//               rx={1.5}
//              
//             />
//           </g>
//           <path
//             id="Bottom"
//             d="M59.1516 258.5H113.094C114.145 258.5 114.871 259.554 114.495 260.536L109.525 273.536C109.303 274.116 108.745 274.5 108.123 274.5H65.2692C64.6882 274.5 64.1594 274.164 63.912 273.639L57.7943 260.639C57.3262 259.644 58.052 258.5 59.1516 258.5Z"
//            
//           />
//           <path
//             id="Wing 2"
//             d="M120.841 214.529L167.305 246.014C167.669 246.26 167.906 246.654 167.955 247.09L170.175 267.095C170.292 268.154 169.298 268.995 168.272 268.703L119.589 254.824C118.944 254.64 118.5 254.051 118.5 253.381V215.771C118.5 214.568 119.845 213.854 120.841 214.529Z"
//            
//           />
//           <path
//             id="Wing 1"
//             d="M51.1586 214.529L4.69458 246.014C4.33096 246.26 4.0936 246.654 4.04516 247.09L1.82546 267.095C1.70788 268.154 2.70225 268.995 3.72755 268.703L52.4112 254.824C53.0556 254.64 53.5 254.051 53.5 253.381V215.771C53.5 214.568 52.1546 213.854 51.1586 214.529Z"
//            
//           />
//       </g>
//       <g id="Thrust">
        
          
         
//         />
//       </g>
//     </g>
//   </svg>
// )

