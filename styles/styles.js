
//window height
let WindowHeight = window.innerHeight;
const navBar = document.querySelector("header");
let navHeight = 0;

document.addEventListener('DOMContentLoaded', e => {
    navHeight = Number(window.getComputedStyle(navBar, null).height.replace("px", ""));
    // add smooth scrolling on anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const elPosY = document.querySelector(e.target.getAttribute('href')).offsetTop;

            console.log(elPosY + navHeight + 15)
            window.scrollTo({
                top: elPosY + 15,
                behavior: 'smooth'
            });
        });
    });
})


// add resize event listener
window.addEventListener('resize', e => {
    WindowHeight = window.innerHeight;
    navHeight = window.getComputedStyle(navBar, null).height;
});