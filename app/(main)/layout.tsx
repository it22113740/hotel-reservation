import NavBar from "@/components/client/NavBar"
import Footer from "@/components/client/Footer"
const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default MainLayout