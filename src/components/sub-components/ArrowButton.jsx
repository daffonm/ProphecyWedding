export default function ArrowButton({cls = "w-7 h-7", direction = "left", color="black", onClick}) {

   switch(direction) {
    case "left":
        return (
            <button
            onClick={onClick}
            className={`${cls} flex justify-center items-center`}
            >
                <img src={`/icons/icons8-arrowL-${color === "black"? "50.png" : "white.png"}`} alt="" className="w-full h-full"/>
            </button>
        )
    case "right":
        return (
            <button
            onClick={onClick}
            className={`${cls} flex justify-center items-center`}
            >
                <img src={`/icons/icons8-arrowR-${color === "black"? "50.png" : "white.png"}`} alt="" className="w-full h-full"/>
            </button>
        )
    }
            

}