import { map } from "./AdvancedMaths.js";

(() => {
    // retrieve all scrollable background elements
    const SCROLL_ELEMENTS = document.querySelectorAll("[scroll-background]");
    let winH = 0;

    /**
     * Get computed height
     */
    const initialSetUp = () => {
        SCROLL_ELEMENTS.forEach(el => {
            // set attribute height
            let h = Math.round(el.getBoundingClientRect().height);
            el.setAttribute("scroll-height", h);
            // calculate offset
            let depth = Number(el.getAttribute("scroll-depth")) ?? 100;
            let offset = 100 - depth;
            el.setAttribute("scroll-offset", offset == 0 ? 0 : offset / 2);
            // compute size
            // get img source
            const bg = window.getComputedStyle(el, null).background.split('url("')[1].split('"')[0];
            // get dom element size
            const domDims = el.getBoundingClientRect();
            const dims = { w: domDims.width, h: domDims.height };
            // create a new image to retrieve original size
            const img = new Image();
            img.src = bg;
            img.onload = e => {
                const srcDims = { w: e.target.width, h: e.target.height }
                const relW = srcDims.w / dims.w; // width relationship
                const relH = srcDims.h / dims.h; // height relationship
                // set background size
                console.log(relW > relH)
                el.style.backgroundSize = `${relW > relH ? 'auto' : '100%'} ${relW > relH ? '200%' : 'auto'}`;
            }
            // get window height
            winH = window.innerHeight;
        });
    }
    initialSetUp();

    const computeVisibility = (el) => {
        SCROLL_ELEMENTS.forEach(el => {
            // determine if the element is visible
            const sh = Number(el.getAttribute("scroll-height"));
            const DOMPos = el.getBoundingClientRect();
            // if element is inside the screen
            if (DOMPos.y + sh > 0 && DOMPos.y < winH) computeScroll(el, DOMPos);
        })
    }


    const computeScroll = (element) => {
        // retrieve dom positioning
        const domPosition = element.getBoundingClientRect();
        // dom position vertical
        const posY = domPosition.y;
        // element height position vertical
        const h = Number(element.getAttribute("scroll-height"));
        // scroll depth or default
        let depth = Number(element.getAttribute("scroll-depth")) ?? 100;
        depth = depth > 100 ? 100 : depth < 0 ? 0 : depth;
        // scroll depth or default
        const offset = Number(element.getAttribute("scroll-offset"));
        // set position
        element.style.backgroundPosition = `50% ${map(posY, -h, winH, offset, depth)}%`
    }


    // add resize event listener triggers only if window height changes
    window.addEventListener("resize", e => {
        if (window.innerHeight != winH) initialSetUp();
    })


    // add scroll listener
    document.addEventListener('scroll', e => {
    });

    // add contentloaded listener
    document.addEventListener('DOMContentLoaded', e => {
        SCROLL_ELEMENTS.forEach(el => {
            // determine if the element is visible
            const sh = Number(el.getAttribute("scroll-height"));
            const DOMPos = el.getBoundingClientRect();
            if (DOMPos.y < 0) {
                // when its visible from above
                if (DOMPos.y + sh > 0) computeScroll(el, DOMPos);
            } else {
                // visible from below
                if (DOMPos.y < winH) computeScroll(el, DOMPos)
            }
        })
    });
})()