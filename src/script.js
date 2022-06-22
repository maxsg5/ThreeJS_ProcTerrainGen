import App from "./App";
/*
Main Animation Loop
*/
const app = new App();
app.initialize();
app.loadHeightmap();
app.onStart();

function animate()

{
    app.onUpdate();
    app.onRender();
    requestAnimationFrame(animate);
}
animate();
