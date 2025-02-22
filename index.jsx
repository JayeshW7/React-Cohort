import ReactDOM from 'react-dom/client';
import App from "./App"
import { ClerkProvider } from '@clerk/clerk-react';
import { dark, shadesOfPurple } from '@clerk/themes';

const clerk_key =  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerk_key){
    throw new Error("Key was not found");
}

ReactDOM
    .createRoot(document.getElementById('root'))
    .render(
    <ClerkProvider publishableKey={clerk_key}
    appearance={{
        baseTheme: [dark, shadesOfPurple],
    }}
    >
        <App />
    </ClerkProvider>   
);

console.log(clerk_key);