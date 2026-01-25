import Navbar from "@/components/Navbar"

export default function PackageListing() {

    const packages = [
        { name: 'Standart', price: 100 },
        { name: 'Full Story', price: 150 },
        { name: 'Custom', price: 200 },
    ]

    return (
        <div>
            <Navbar />
            {/* Hero Section */}
            <div className="bg-gray-100 py-40 h-svh mx-auto text-center">
                img box
            </div>

            <section>
                <div className="container mx-auto pt-20 pb-20 h-svh">
                    <h2 className="text-4xl section-title text-center">Our Packages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
                        {packages.map((pkg, index) => (
                            <div key={index} className="border p-6 rounded-lg shadow-md text-center">
                                <div className="package-img mb-4 w-full h-88 bg-gray-200 flex items-center justify-center">
                                    img box
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">{pkg.name}</h3>
                                <p className="text-xl mb-6">${pkg.price}</p>
                                <button className="button1">Reserve</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}