"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "next"

import SideMenu from "@/dashboard-components/SideMenu";

export default function VendorHub({}) {
    return (
        <div>
            <h1>Vendor Hub</h1>
        </div>
    )
}

// export default function VendorHub({}) {

//     const sideMenu = useMemo(
//         () => [
//           {
//             name: "Vendor Profile",
//             component: null,
//             props: {
             
//             },
//             sub: [
//               { name: "Product & Services", component: null, props: {}, parent: "Booking Lists" },
//             ],
//           },
//           { 
//             name: "Events", component: null, props: {},
//             sub: [
//                 { name: "Order & Requests", component: null, props: {}, parent: "Events" },
//                 { name: "History", component: null, props: {}, parent: "Events"}
//             ] 
//             },
//         ],
//         []
//       );

//     const [activeMenu, setActiveMenu] = useState("Vendor Profile");
//     const [activeSubMenu, setActiveSubMenu] = useState(null);
//     const activeItem = useMemo(() => {
//         const parent = sideMenu.find((m) => m.name === activeMenu) || null;
//         if (!parent) return null;
    
//         if (activeSubMenu && parent.sub) {
//           const sub = parent.sub.find((s) => s.name === activeSubMenu) || null;
//           if (sub) return sub;
//         }
    
//         return parent;
//       }, [sideMenu, activeMenu, activeSubMenu]);
    
//       const ActiveMenuComponent = activeItem?.component || null;
//       const activeMenuProps = activeItem?.props || {};
//       const activeTitle = activeSubMenu ? activeSubMenu : activeMenu;


//     return (
//         <div>
//             {/* Side Menu */}
//             <div>
//                 <SideMenu
//                     activeMenu={activeMenu}
//                     activeSubMenu={activeSubMenu}
//                     setActiveMenu={setActiveMenu}
//                     setActiveSubMenu={setActiveSubMenu}
//                     sideMenu={sideMenu}
//                 />
//             </div>
//             {/* Container */}
//             <div>

//             </div>
//         </div>
//     )
// }