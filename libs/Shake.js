(() => {

    class Shaker {
        #element;
        #tfactor;
        /**
         * 
         * @param {object} element DOM element to apply shake effect
         * @param {{
         * angle: number,
         * perspective: number,
         * scale: number,
         * shadow: boolean,
         * glow: boolean,
         * invert: boolean,
         * floating: boolean,
         * nox: boolean,
         * noy: boolean,
         * }} options Shake options
         */
        constructor(element, options) {
            var id = element.id ?? undefined;
            var name = element.getAttribute('name') ?? undefined;
            var invalid = true;
            //validate id or name
            if (id != undefined && id != "") invalid = false;
            if (invalid && (name == undefined || name == "")) return console.error('Error al intentar injectar el estilo para el elemento ' +
                JSON.stringify(element) + ' debido a que este no tiene un id o atributo nombre.');

            const selector = id == undefined ? `[shake][name="${name}"]` : `#${id}[shake]`;
            if (!invalid) {
                //add css
                const stylesheet = document.styleSheets[0];
                // insert standard rules
                for (var cls of this.#rules) {
                    stylesheet.insertRule(cls.replace('[shake]', selector));
                }
                //add glow code
                if (options.glow) {
                    //add css selector
                    stylesheet.insertRule(selector + '{--glow: ' + this.#glow + ';}');
                    for (var cls of this.#glows) {
                        stylesheet.insertRule(cls.replace('[shake]', selector));
                    }
                }
                //add shadow code
                if (options.shadow) {
                    //add css selector for each element accord to its name or id
                    var id = element.id;
                    var ok = false;
                    stylesheet.insertRule(selector + '{--shadow-color: ' + this.#shadow + ';}');
                    for (var cls of this.#shadows) {
                        stylesheet.insertRule(cls.replace('[shake]', selector));
                    }
                }

                //make element global
                this.#element = element;
                //add shaker classname
                this.#element.className = this.#element.className + ' shaker';
                //calculations for depth factor, this variable is the amount of displacement on childs elements
                this.#tfactor = (1 / options.perspective) * 10000;
                //get stylesheet reference for every angle update
                this.style = document.querySelector('.shaker').style;
                //add listeners
                this.#shakerElement(element, options);
            }
        }

        #shakerElement = (element, options) => {
            //get element nodes
            const nods = element.children;
            //set static css variables
            if (options != undefined) {
                if (options.angle != undefined) this.style.setProperty('--maxangle', options.angle + 'deg');
                if (options.perspective != undefined) this.style.setProperty('--persp', options.perspective + 'px');
                if (options.scale != undefined) this.style.setProperty('--scale', options.scale);
            }
            //add listener when mouuse is over
            element.addEventListener('mousemove', async e => {
                //get element coordinates
                const coords = this.#elementCoords(e.target);
                //mouse coords normalized between 0 and element width
                const mouse = { 'x': e.clientX - coords.posx, 'y': e.clientY - coords.posy };
                //calc "angle", value between -1 to 1 to be multiplied for angle cap
                var xangle = 0;
                if (!options.nox) {
                    //validate in wich half mouse is over
                    xangle = mouse.x < coords.hw ?
                        //for first half the value should be positive but grows to the edge
                        1 - (mouse.x / coords.hw) :
                        //for second half the value should be negative grows (to 0) towards the center
                        ((coords.hw - mouse.x) / coords.hw);
                }

                //same for y angle 
                var yangle = 0;
                if (!options.noy) {
                    yangle = mouse.y < coords.h.y ?
                        //top angle should be negative and grows (to 0) towards the center
                        -1 + (mouse.y / coords.hh) :
                        //botom angle should be positive and grows to the edge
                        ((coords.hh - mouse.y) / coords.hh) * -1;
                }
                if (options.invert) {
                    yangle = -1 * yangle;
                    xangle = -1 * xangle;
                }
                //update angle variables
                element.style.setProperty('--xangle', xangle);
                element.style.setProperty('--yangle', yangle);

                //update childs displacement if enabled
                if (options.floating) {
                    var depth, x, y, depth2, x2, y2;
                    for await (let node of nods) {
                        depth = node.getAttribute('shake-depth');
                        //x axis displacement
                        x = (Number(depth) * xangle) * this.#tfactor;
                        //y axis displacement
                        y = (Number(depth) * -yangle) * this.#tfactor;
                        //update element translation
                        node.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                        //fix default overlaping
                        node.style.zIndex = Math.round(depth);

                        for (let ch of node.children) {
                            depth2 = ch.getAttribute('shake-depth');
                            //x axis displacement
                            x2 = (Number(depth2) * xangle) * this.#tfactor;
                            //y axis displacement
                            y2 = (Number(depth2) * -yangle) * this.#tfactor;
                            //update element translation
                            ch.style.transform = 'translate(' + x2 + 'px,' + y2 + 'px)';
                            //fix default overlaping
                            ch.style.zIndex = Math.round(depth2);
                        }
                    }
                }
            });

            //listener when mouse is out, reset translate positions of each child node
            element.addEventListener('mouseleave', e => {
                if (options.floating) {
                    for (let node of nods) {
                        //reset childs translation
                        node.style.transform = 'translate(0px,0px)';
                        for (let ch of node.children) {
                            ch.style.transform = 'translate(0px,0px)';
                        }
                    }
                }
            });
        }

        #elementCoords = (element) => {
            let pos = element.getBoundingClientRect();
            let coords = {};
            //top left corner coordinates
            coords['posx'] = pos.x;
            coords['posy'] = pos.y;
            //half of element dimensions
            coords['hw'] = pos.width / 2; //Half Width
            coords['hh'] = pos.height / 2; //Half Height
            //element dimensions    ALERT: not used
            coords['w'] = pos.width;
            coords['h'] = pos.height;
            return coords;
        }

        #rules = [
            `[shake]{
            position: relative;
            --xangle: 0;
            --yangle: 0;
            --maxangle: 30deg;
            --scale: 1;
            --persp: 800px;
            transition: all 0.2s linear;
            transform: scale(1) rotate3d(0,0,0,0);
        }`,

            `[shake] *{
            pointer-events: none;
            user-select: none;
            transition: all 0.2s linear;
        }`,

            `[shake]:hover{
            scale: var(--scale);
            transform: perspective(var(--persp)) rotateY(calc(var(--xangle) * var(--maxangle)))rotateX(calc(var(--yangle) * var(--maxangle)));
        }`
        ];


        #shadows = [
            `[shake]::after{
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: transparent;
            border-radius: inherit;
            filter: blur(10px);
            transition: all 0.2s linear;
            mix-blend-mode: screen;
            pointer-events: none;
        }`,

            `[shake]:hover::after{
            background: rgba(0,0,0,0.4);
            transform: perspective(calc(var(--persp)/2.5)) rotateY(calc(var(--xangle) * var(--maxangle) * 0.6)) rotateX(calc(var(--yangle) * var(--maxangle)* 0.6));
        }`
        ];

        #glows = [
            `[shake]::before{
            content: "";
            background: transparent;
            position: absolute;
            top: 0;
            left: calc(0);
            width: 100%;
            height: 100%;
            transition: all 0.2s linear;
            pointer-events: none;
            z-index: 100;
        }`,

            `[shake]:hover:before{
            background: var(--glow) ;
            transform: translateX(calc(30% * var(--xangle) * -1)) translateY(calc(30% * var(--yangle)));
        }`
        ];

        #glow = 'radial-gradient(rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 20%, transparent 50%)';

        #shadow = '#00000090';

    }
    const init = () => {
        // retrieve all shake elements
        const elements = document.querySelectorAll('[shake]');
        elements.forEach(el => {
            //options
            const options = {};
            // set angle or default
            options.angle = el.getAttribute('shake-angle') ?? 45;
            // set perspective or default
            options.perspective = el.getAttribute('shake-perspective') ?? 800;
            // set scale or default
            options.scale = el.getAttribute('shake-scale') ?? 1;
            // set shadow or default
            options.shadow = el.getAttribute('shake-shadow') == null ? false : true;
            // set glow or default
            options.glow = el.getAttribute('shake-glow') == null ? false : true;
            // set invert or default
            options.invert = el.getAttribute('shake-invert') == null ? false : true;
            // set floating or default
            options.floating = el.getAttribute('shake-floating') == null ? false : true;
            // set nox or default
            options.nox = el.getAttribute('shake-nox') == null ? false : true;
            // set noy or default
            options.noy = el.getAttribute('shake-noy') == null ? false : true;
            // init shaker
            const sh = new Shaker(el, options)
        })
    }

    document.addEventListener('change', init);
    document.addEventListener('DOMContentLoaded', init);


})()