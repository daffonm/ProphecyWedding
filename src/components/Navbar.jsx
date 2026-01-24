import Link from "next/link";
export default function Navbar({links}) {
    return <nav className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Prophecy Wedding</h1>
            <ul className="flex space-x-6">
                {links.map((link, index) => (
                    <li key={index}>
                        <Link href={link.href} className="hover:text-gray-700">{link.name}</Link>
                    </li>
                ))}
            </ul>
            <div className="flex flex-row items-center gap-8">
                <Link href="/login">Sign Up</Link>
                <Link href="/register" className="button1">Sign In</Link>
            </div>
        </div>
    </nav>;
}