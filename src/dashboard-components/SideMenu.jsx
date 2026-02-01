// /mnt/data/SideMenu.jsx

function MenuList({
  name,
  sub,
  activeMenu,
  activeSubMenu,
  onMenuClick,
  onSubMenuClick,
}) {
  const isOpen = activeMenu === name;

  // Parent dianggap "aktif" hanya ketika:
  // - menu ini open
  // - dan tidak ada sub-menu yang sedang aktif
  const isMainActive = isOpen && !activeSubMenu;

  // Kalau sub-menu aktif, parent harus netral (tidak meninggalkan style aktif)
  const mainClass = isMainActive
    ? "pt-4 pl-4 pb-4 font-bold w-full flex bg-emerald-500 rounded-2xl text-white transition-all duration-300 ease-in-out"
    : "pl-2 pt-4 pb-4 w-full flex rounded-2xl transition-all duration-300 ease-in-out hover:bg-emerald-500/10";

  // Animasi buka-tutup branch: opacity + max-height + translate
  const branchClass = isOpen
    ? "mt-2 pl-4 overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100 translate-y-0"
    : "mt-2 pl-4 overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 -translate-y-1";

  return (
    <div className="select-none">
      <button className={mainClass} onClick={() => onMenuClick(name)}>
        {name}
      </button>

      {/* Branch selalu dirender untuk transisi yang smooth */}
      <div className={branchClass}>
        {sub &&
          sub.map((s) => {
            const isSubActive = activeSubMenu === s.name;

            const subClass = isSubActive
              ? "pt-3 pl-4 pb-3 font-bold w-full text-left bg-emerald-500 rounded-2xl text-white transition-all duration-300 ease-in-out"
              : "pl-2 pt-3 pb-3 w-full text-left rounded-2xl transition-all duration-300 ease-in-out hover:bg-emerald-500/10";

            return (
              <button
                key={s.name}
                className={subClass}
                onClick={() => onSubMenuClick(s.name)}
              >
                {s.name}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default function SideMenu({
  activeMenu,
  activeSubMenu,
  setActiveMenu,
  setActiveSubMenu,
  sideMenu,

  dashboardName = "Prophecy Wedding",
}) {
  const handleMenuClick = (menuName) => {
    // Klik menu utama lain -> pindah parent + tutup branch sebelumnya + reset sub
    setActiveMenu(menuName);
    setActiveSubMenu(null);
  };

  const handleSubMenuClick = (subName) => {
    // Klik sub-menu -> aktif pindah ke sub-menu, parent tetap open tapi netral
    setActiveSubMenu(subName);
  };

  return (
    <div className="w-96 p-4 flex flex-col justify-between bd h-full">
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center mb-4 mt-2">
          <h2 className="text-2xl">{dashboardName}</h2>
        </div>

        <div className="flex flex-col p-4 gap-1">
          {sideMenu.map((menu) => (
            <MenuList
              key={menu.name}
              name={menu.name}
              sub={menu?.sub}
              activeMenu={activeMenu}
              activeSubMenu={activeSubMenu}
              onMenuClick={handleMenuClick}
              onSubMenuClick={handleSubMenuClick}
            />
          ))}
        </div>
      </div>

      <div>
        <button className="rounded-2xl px-4 py-2 transition-all duration-300 ease-in-out hover:bg-emerald-500/10">
          Logout
        </button>
      </div>
    </div>
  );
}
