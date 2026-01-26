function MenuList({ name, href, current, onClick }) {
    return (
        <button className={current ? 
        "bd pt-4 pl-4 pb-4 font-bold w-full flex bg-emerald-500 rounded-2xl text-white transition duration-100" 
        : "pl-2 pt-4 pb-4 w-full flex transition duration-100 rounded-2xl"} onClick={onClick}>
            {name}
        </button>
    );
}

export default function SideMenu({activeMenu, setActiveMenu, sideMenu}) {

    
    return (
        <>
                {/* Left Navigation */}
                <div className="w-96 p-4 flex flex-col justify-between bd h-full">
                    <div className="flex flex-col h-full">

                        {/* top */}
                        <div className="flex flex-col items-center mb-4 mt-2">
                            <h2 className="text-2xl">Prophecy Wedding</h2>
                        </div>
                        {/* Navigation Lists */}
                        <div className="flex flex-col p-4 ">
                            {sideMenu.map((list) => (
                                <MenuList
                                    key={list.name}
                                    name={list.name}
                                    href={list.href}
                                    current={activeMenu === list.name}
                                    onClick={() => setActiveMenu(list.name)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <button>Logout</button>
                    </div>
                    
                    
                    <div>

                    </div>
                </div>
            </>
    )
}