/**
 * This is a FraktLabs Custom Element
 * 
 *      How to use?
 * 
 * 1. Add 'scroll-background' attribute on your element
 * 2. Add 'scroll-depth' attribute on your element between 0 and 100 
 *    this value is the portion of the source element, that will be 
 *    visible.
 * 3. Add 'scroll-inverted="true"' attribute if you want reverse scrolling
 */

(() => {
    // retrieve all scrollable background elements
    let SCROLL_ELEMENTS = document.querySelectorAll("[scroll-background]");
    let winH = 0; // window Height
    let triggerRanges = [];

    /**
     * Map a number between source range and target range
     * @param {number} number number to map
     * @param {number} smin source range min value
     * @param {number} smax source range max value
     * @param {number} tmin target range min value
     * @param {number} tmax target range max value
     * @returns mapped number
     * @example 
     */
    const map = (number, smin, smax, tmin, tmax) => {
        return (number - smin) / (smax - smin) * (tmax - tmin) + tmin;
    }

    /**
     * Set Up initial settings
     */
    const initialSetUp = () => {
        SCROLL_ELEMENTS = document.querySelectorAll("[scroll-background]");
        // loop throuhg all scrollable elements
        SCROLL_ELEMENTS.forEach(el => {

            let depth = Number(el.getAttribute("scroll-depth")) ?? 100;
            // normalize depth
            depth = depth > 100 ? 100 : depth < 0 ? 0 : depth;
            el.setAttribute("scroll-depth", depth);
            // calculate offset
            let offset = 100 - depth;
            el.setAttribute("scroll-offset", offset == 0 ? 0 : offset / 2);
            // get img source
            let bg = window.getComputedStyle(el, null).background.split('url("')[1].split('"')[0];
            // get dom element dimensions
            let domDims = el.getBoundingClientRect();
            let dims = { w: domDims.width, h: domDims.height };
            // create a new image to retrieve it's original size
            let img = new Image();
            img.src = bg;
            img.onload = e => {
                // retrieve source image dimensions
                let srcDims = { w: e.target.width, h: e.target.height }
                let relW = srcDims.w / dims.w; // width relationship source->element
                let relH = srcDims.h / dims.h; // height relationship source->element
                // set calculated background size
                el.style.backgroundSize = `
                    ${relW > relH ? 'auto' : '100%'} 
                    ${relW > relH ? '200%' : 'auto'}
                `;
            }
            // get window height
            winH = window.innerHeight;
            // compute trigger ranges
            let bcr = el.getBoundingClientRect();
            let offTop = getOffset(el);
            triggerRanges.push({
                element: el,
                // min height element top position - window height
                min: Math.round(offTop - winH),
                // max: element top position + element height + window height
                max: Math.round(offTop + bcr.height + winH)
            })
            console.log(el)
        });
        computeVisibility();
    }

    const computeVisibility = () => {
        // loop through all ranges
        triggerRanges.forEach(trg => {
            // validation
            if (window.scrollY > trg.min
                && window.scrollY < trg.max) computeScroll(trg.element);
        })
    }

    const getOffset = (element) => {
        let top = element.offsetTop;
        let parent = element.parentNode;
        while (parent.tagName != "BODY") {
            top += parent.offsetTop;
            parent = parent.parentNode;
        }
        return top;
    }


    const computeScroll = (element) => {
        // retrieve dom positioning
        const domPosition = element.getBoundingClientRect();
        // dom position vertical
        const posY = domPosition.y;
        // element height position vertical
        const h = domPosition.height;
        // scroll depth or default
        let depth = Number(element.getAttribute("scroll-depth"));
        // scroll depth or default
        const offset = Number(element.getAttribute("scroll-offset"));
        // inverted scrolling
        const inverted = element.getAttribute("scroll-inverted");
        // set position
        if (!inverted) element.style.backgroundPosition = `50% ${map(posY, -h, winH, depth, offset)}%`;
        else element.style.backgroundPosition = `50% ${map(posY, -h, winH, offset, depth)}%`;
    }


    // add resize event listener triggers only if window height changes
    window.addEventListener("resize", e => {
        if (window.innerHeight != winH) initialSetUp();
    })


    // add scroll listener
    document.addEventListener('scroll', computeVisibility);

    // add contentloaded listener
    document.addEventListener('DOMContentLoaded', initialSetUp);
})()