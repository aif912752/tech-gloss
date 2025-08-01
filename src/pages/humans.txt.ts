import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const humansTxt = `/* TEAM */
Developer: TechGloss Team
Contact: hello [at] techgloss.dev
Twitter: @techgloss
From: Thailand

/* THANKS */
Astro: https://astro.build
Tailwind CSS: https://tailwindcss.com
TypeScript: https://www.typescriptlang.org

/* SITE */
Last update: ${new Date().toISOString().split('T')[0]}
Language: Thai / ไทย
Doctype: HTML5
IDE: Visual Studio Code, Kiro
Standards: HTML5, CSS3, ES2022
Components: Astro, TypeScript, Tailwind CSS
Software: Astro, Node.js, npm

/* LOCATION */
Country: Thailand
Timezone: Asia/Bangkok (UTC+7)

                               -o/-                     
                              +oooo/                    
                             +oooooo/                   
                            -+oooooo+:                  
                            /:-:++oooo+:                
                           /++++/+++++++:               
                          /++++++++++++++:              
                         /+++ooooooooo+++/              
                        ./ooosssso++osssoo+.            
                       .oossssso-::-osssssoo.           
                      -osssssso.    .osssssso-          
                     :osssssss/      /sssssss+:         
                    /ossssssss/      /ssssssss+/        
                   +sssssssss+        +sssssssss+       
                  -osssssssso          osssssssso-      
                 .+sssssssss+          +sssssssss+.     
                 +sssssssss+            +sssssssss+     
                +sssssssss/              /sssssssss+    
               /sssssssss/                /sssssssss/   
              .osssssssso                  osssssssso.  
              :sssssssss+                  +sssssssss:  
              +sssssssss:                  :sssssssss+  
              +sssssssss-                  -sssssssss+  
              +sssssssss-                  -sssssssss+  
              +sssssssss:                  :sssssssss+  
              :sssssssss+                  +sssssssss:  
              .osssssssso                  osssssssso.  
               /sssssssss/                /sssssssss/   
                +sssssssss/              /sssssssss+    
                 +sssssssss+            +sssssssss+     
                 .+sssssssss+          +sssssssss+.     
                  -osssssssso          osssssssso-      
                   +sssssssss+        +sssssssss+       
                    /ossssssss/      /ssssssss+/        
                     :osssssss/      /sssssss+:         
                      -osssssso.    .osssssso-          
                       .oossssso-::-osssssoo.           
                        ./ooosssso++osssoo+.            
                         /+++ooooooooo+++/              
                          /++++++++++++++:              
                           /++++/+++++++:               
                            /:-:++oooo+:                
                            -+oooooo+:                  
                             +oooooo/                   
                              +oooo/                    
                               -o/-                     

🌿 TechGloss - Green Knowledge for Developers 🌿`;

  return new Response(humansTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};