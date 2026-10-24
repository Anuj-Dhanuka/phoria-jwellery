document.addEventListener('DOMContentLoaded', () =>{
  const updateCursor = () =>{
   if(window.innerWidth > 959 && !document.querySelector('#custom__cursor')){
      const customCursor = document.createElement('div');
      customCursor.setAttribute('id', 'custom__cursor')
      document.body.appendChild(customCursor)
      customCursor.style.visibility = 'hidden';
      document.addEventListener("mousemove", (e) => {
          customCursor.style.visibility = 'visible';
          const cursorSize = customCursor.offsetWidth / 2;
      
          const hoveredElement = e.target;
          const computedStyle = window.getComputedStyle(hoveredElement);
          
          // Check if cursor is set to 'pointer'
          if (computedStyle.cursor === "pointer") {
              customCursor.style.transform = `translate3d(${e.clientX - cursorSize}px, ${e.clientY - cursorSize}px, 0px) scale(3)`;
          } else {
              customCursor.style.transform = `translate3d(${e.clientX - cursorSize}px, ${e.clientY - cursorSize}px, 0px)`;
          }
      });
    }else{
     document.querySelector('#custom__cursor')?.remove()
    }
  }
  window.addEventListener('resize', updateCursor);
  updateCursor()
})