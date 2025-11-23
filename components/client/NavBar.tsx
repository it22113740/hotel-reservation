import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { Button } from "../ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const LankaStayLogo = () => {
    return (
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.5 15.2 16 7l9.5 8.2-1.3 1.5L16 10.6l-8.2 6.1-1.3-1.5ZM10 16.5V24h4v-4.5h4V24h4v-7.5l-2-1.6V22h-2v-4.5h-8V22H8v-7.6l2-1.9Z"
            />
        </svg>
    );
};

const NavBar = () => {
    return (
        <Navbar className="mt-5">
            <NavbarBrand>
                <Link href="/" className="flex items-center gap-2">
                    <LankaStayLogo />
                    <p className="font-bold text-inherit">LankaStay</p>
                </Link>
            </NavbarBrand>
            
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link href="/" className="text-foreground hover:text-primary transition-colors">
                        Home
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/hotels" className="text-foreground hover:text-primary transition-colors">
                        Hotels
                    </Link>
                </NavbarItem>
                <SignedIn>
                    <NavbarItem>
                        <Link href="/booking" className="text-foreground hover:text-primary transition-colors">
                            My Bookings
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link href="/me" className="text-foreground hover:text-primary transition-colors">
                            Profile
                        </Link>
                    </NavbarItem>
                </SignedIn>
            </NavbarContent>
            
            <NavbarContent justify="end">
                {/* Show Login & Sign Up when user is NOT logged in */}
                <SignedOut>
                    <NavbarItem className="hidden lg:flex">
                        <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                            Login
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Button variant="default" asChild>
                            <Link href="/register">Sign Up</Link>
                        </Button>
                    </NavbarItem>
                </SignedOut>
                
                {/* Show User Button when logged in */}
                <SignedIn>
                    <NavbarItem>
                        <UserButton 
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10"
                                }
                            }}
                        />
                    </NavbarItem>
                </SignedIn>
            </NavbarContent>
        </Navbar>
    )
}

export default NavBar