import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-bold">Welcome to Glu</h1>
          <SignInButton />
        </div>
      </SignedOut>
      
      <SignedIn>
        <nav className="w-full border-b">
          <div className="container mx-auto px-4">
            <NavigationMenu className="flex justify-between w-full py-4">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4">
                      <p>Feature content here</p>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
              
              <UserButton />
            </NavigationMenu>
          </div>
        </nav>
        
        <main className="flex-1 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-bold">Integrations</h1>
          <Button onClick={() => router.push('/instructions')}>Next</Button>
        </main>
      </SignedIn>
    </div>
  );
}
