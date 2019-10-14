window.onload = function(){

    const items = document.querySelectorAll('.js-collapse');

    const collapseDown = (node) => {
        node.style.overflowY = 'hidden';
        node.dataset.height = node.scrollHeight;

        const options = {
            type: 'CLOSE',
            from: node.scrollHeight,
            to: 0,
            distance: -node.scrollHeight,
            duration: 250,
        }

        window.requestAnimationFrame((timestamp) => animate(node, options, timestamp));
    }

    const collapseUp = (node) => {
        node.style.overflowY = 'hidden';
        const options = {
            type: 'OPEN',
            from: 0,
            to: +node.dataset.height,
            distance: +node.dataset.height,
            duration: 250,
        }
        window.requestAnimationFrame((timestamp) => animate(node, options, timestamp));
    }

    const animate = (element, options, timestamp) => {
        if(!options.startTime) {
            options.startTime = timestamp;
        }

        if(options.type === 'OPEN') {
            element.style.display = 'block';
        }

        const currentTime = timestamp - options.startTime;
        let animationContinue = currentTime < options.duration;
        let newHeight = options.from - (currentTime / options.duration) * -options.distance;

        if(animationContinue) {
            element.style.height = `${newHeight.toFixed(2)}px`;
            window.requestAnimationFrame((timestamp) => animate(element, options, timestamp));
        } else {
            if(options.type === 'CLOSE') {
                element.style.display = 'none';
                element.style.height = '0px';
            } 
            if(options.type === 'OPEN') {
                element.style.height = `${options.distance}px`;
                element.style.height = "";
            } 
        }
    }

    const collapseToggle = (e) => {
        const element = document.querySelector(e.target.dataset.target);
        if(e.target.classList.contains('--collapsed')){
            e.target.classList.remove('--collapsed');
            collapseUp(element);
        } else {
            e.target.classList.add('--collapsed');
            collapseDown(element);
        }
    }

    items.forEach((node) => {
        node.addEventListener('click', (e) => collapseToggle(e));
    })

}