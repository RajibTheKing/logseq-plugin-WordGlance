export const animateWord = (element: HTMLElement) => {
    // Simple animation that makes the word "glance" (subtle movement)
    element.style.transition = 'all 0.5s ease';
    
    const animate = () => {
      element.style.transform = 'translateX(5px)';
      setTimeout(() => {
        element.style.transform = 'translateX(-5px)';
        setTimeout(() => {
          element.style.transform = 'translateX(0)';
          setTimeout(animate, 1000);
        }, 500);
      }, 500);
    };
    
    animate();
    
    return () => {
      element.style.transform = '';
      element.style.transition = '';
    };
  };