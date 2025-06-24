document.addEventListener('DOMContentLoaded', function() {
    // 模拟用户登录状态
    let isLoggedIn = false; // 初始状态为未登录
    
    // 切换登录状态函数
    function toggleLoginStatus() {
        isLoggedIn = !isLoggedIn;
        updateUI();
    }

    // 更新UI显示
    function updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
        const mobileUserInfo = document.getElementById('mobile-user-info');
        if (isLoggedIn) {
            // 显示用户信息，隐藏登录注册按钮
            authButtons.classList.add('hidden');
            userInfo.classList.remove('hidden');
            mobileAuthButtons.classList.add('hidden');
            mobileUserInfo.classList.remove('hidden');
        } else {
            // 显示登录注册按钮，隐藏用户信息
            authButtons.classList.remove('hidden');
            userInfo.classList.add('hidden');
            mobileAuthButtons.classList.remove('hidden');
            mobileUserInfo.classList.add('hidden');
        }
    }
    
    // 移动菜单切换
    // const mobileMenuButton = document.getElementById('mobile-menu-button');
    // const mobileMenu = document.getElementById('mobile-menu');
    // if(mobileMenuButton && mobileMenu) {
    //     mobileMenuButton.addEventListener('click', () => {
    //         mobileMenu.classList.toggle('hidden');
    //         // 切换菜单图标
    //         const icon = mobileMenuButton.querySelector('i');
    //         if (mobileMenu.classList.contains('hidden')) {
    //             icon.classList.remove('fa-times');
    //             icon.classList.add('fa-bars');
    //         } else {
    //             icon.classList.remove('fa-bars');
    //             icon.classList.add('fa-times');
    //         }
    //     });
    // }
    
    // 返回顶部按钮
    const backToTopButton = document.getElementById('back-to-top');
    if(backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    //========== 白天/夜间模式切换功能 ==============
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;
    if(themeToggle && themeIcon) {
        // 检查本地存储中的主题偏好
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            htmlElement.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        // 切换主题
        themeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark-mode');
            
            if (htmlElement.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }

});



