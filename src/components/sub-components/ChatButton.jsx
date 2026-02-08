import { useChat } from "@/context/ChatContext"


export default function ChatButton({targetUid = null}) {

    const { openChat, openChatToUserId, hasUnread, unreadCount, getUnreadByChatId } = useChat()


    const handleClick = () => {
        targetUid? openChatToUserId(targetUid) : openChat()
    }

    return (
        <button
        onClick={handleClick}
        className="w-7 h-7 relative"
        >
            <img src="/icons/icons8-chat-48.png" alt="" className="w-full h-full"/>
            { hasUnread && 
                <span
                className="top-[-5] right-[-5]
                absolute w-5 h-5 bg-red-500 rounded-full text-white text-xs flex justify-center items-center bold"
                >{unreadCount}</span>
            }

            
        </button>
    )
}