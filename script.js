document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==================== UTILITY FUNCTIONS ====================
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const throttle = (func, limit) => {
        let lastFunc;
        let lastRan;
        return (...args) => {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    };

    // ==================== MOBILE MENU ====================
    const initMobileMenu = () => {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (!mobileMenuBtn || !navLinks) return;

        const toggleMenu = () => {
            const isActive = navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = isActive
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        };

        const closeMenu = () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        };

        mobileMenuBtn.addEventListener('click', toggleMenu);
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    };

    // ==================== BACK TO TOP ====================
    const initBackToTop = () => {
        const backToTopBtn = document.querySelector('.back-to-top');
        if (!backToTopBtn) return;

        const scrollHandler = throttle(() => {
            backToTopBtn.classList.toggle('active', window.scrollY > 300);
        }, 100);

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', scrollHandler);
    };

    // ==================== CONTACT FORM ====================
    const initContactForm = () => {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        const handleSubmit = async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('submit_request.php', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                showAlert(data.success ? 'success' : 'error', data.message);
                if (data.success) contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                showAlert('error', 'An error occurred. Please try again later.');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        };

        contactForm.addEventListener('submit', handleSubmit);
    };

    // ==================== ALERT SYSTEM ====================
    const showAlert = (type, message) => {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) existingAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button class="close-alert">&times;</button>
        `;

        document.body.appendChild(alertDiv);

        const removeAlert = () => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 300);
        };

        setTimeout(removeAlert, 5000);
        alertDiv.querySelector('.close-alert').addEventListener('click', removeAlert);
    };

    // ==================== PRODUCTS ====================
    const initProducts = (() => {
        const createProductCard = (product) => `
            <div class="product-card">
                <a href="product-details.html?product=${encodeURIComponent(product.id)}" class="product-link">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                    </div>
                </a>
            </div>
        `;

        const createVarietyCard = (variety) => `
            <div class="variety-card">
                <div class="variety-image">
                    <img src="${variety.image || 'placeholder.jpg'}" alt="${variety.name}" loading="lazy">
                </div>
                <div class="variety-info">
                    <h3 class="variety-name">${variety.name}</h3>
                </div>
                <div class="quotation-btn">
                    <a href="contact.html" class="btn">Get Quotation</a>
                </div>
            </div>
        `;

        const createCategorySection = (categoryName, productCount) => {
            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
            return `
                <section id="${categoryId}" class="product-category" style="display: none;">
                    <div class="container">
                        <h2 class="category-title">
                            ${categoryName}
                            <span class="product-count">${productCount}</span>
                        </h2>
                        <div class="product-grid" id="${categoryId}-products-grid"></div>
                    </div>
                </section>
            `;
        };

        const createCategoryTab = (categoryName, isActive = false) => {
            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
            return `
                <button class="category-tab ${isActive ? 'active' : ''}" data-category="${categoryId}">
                    ${categoryName}
                </button>
            `;
        };

        const setupTabScrolling = () => {
            const tabsContainer = document.querySelector('.tabs-container');
            if (!tabsContainer) return;

            const scrollLeftBtn = document.getElementById('scroll-left');
            const scrollRightBtn = document.getElementById('scroll-right');
            const scrollAmount = 200;

            let isDown = false;
            let startX;
            let scrollLeft;

            const updateArrowVisibility = debounce(() => {
                if (!scrollLeftBtn || !scrollRightBtn) return;
                scrollLeftBtn.style.display = tabsContainer.scrollLeft > 0 ? 'flex' : 'none';
                const hasMoreToScroll = tabsContainer.scrollLeft < (tabsContainer.scrollWidth - tabsContainer.clientWidth - 5);
                scrollRightBtn.style.display = hasMoreToScroll ? 'flex' : 'none';
            }, 100);

            const handleMouseDown = (e) => {
                isDown = true;
                tabsContainer.style.cursor = 'grabbing';
                startX = e.pageX - tabsContainer.offsetLeft;
                scrollLeft = tabsContainer.scrollLeft;
                e.preventDefault();
            };

            const handleMouseMove = (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - tabsContainer.offsetLeft;
                const walk = (x - startX) * 2;
                tabsContainer.scrollLeft = scrollLeft - walk;
                updateArrowVisibility();
            };

            const handleMouseUp = () => {
                isDown = false;
                tabsContainer.style.cursor = 'grab';
            };

            // Mouse events
            tabsContainer.addEventListener('mousedown', handleMouseDown);
            tabsContainer.addEventListener('mousemove', handleMouseMove);
            tabsContainer.addEventListener('mouseup', handleMouseUp);
            tabsContainer.addEventListener('mouseleave', handleMouseUp);

            // Touch events
            tabsContainer.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - tabsContainer.offsetLeft;
                scrollLeft = tabsContainer.scrollLeft;
            }, { passive: false });

            tabsContainer.addEventListener('touchend', () => {
                isDown = false;
            });

            tabsContainer.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                const x = e.touches[0].pageX - tabsContainer.offsetLeft;
                const walk = (x - startX) * 2;
                tabsContainer.scrollLeft = scrollLeft - walk;
                updateArrowVisibility();
                e.preventDefault();
            }, { passive: false });

            // Button events
            if (scrollLeftBtn) {
                scrollLeftBtn.addEventListener('click', () => {
                    tabsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                });
            }

            if (scrollRightBtn) {
                scrollRightBtn.addEventListener('click', () => {
                    tabsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                });
            }

            // Initial setup
            tabsContainer.style.cursor = 'grab';
            tabsContainer.addEventListener('scroll', updateArrowVisibility);
            window.addEventListener('resize', updateArrowVisibility);
            updateArrowVisibility();
        };

        const loadProducts = async () => {
            const allProductsGrid = document.getElementById('all-products-grid');
            if (!allProductsGrid) return;

            try {
                const response = await fetch('products.json');
                if (!response.ok) throw new Error('Failed to load products');
                const productsData = await response.json();

                const tabsContainer = document.getElementById('category-tabs-container');
                const categorySectionsContainer = document.getElementById('category-sections-container');
                if (!tabsContainer || !categorySectionsContainer) return;

                // Clear existing content
                tabsContainer.innerHTML = '';
                allProductsGrid.innerHTML = '';

                // Create "All" tab
                tabsContainer.innerHTML = createCategoryTab('All', true);

                // Calculate total products
                let totalProducts = 0;
                Object.values(productsData).forEach(category => {
                    totalProducts += category.length;
                });

                // Update "All" tab count
                const allCategoryTitle = document.querySelector('#all .category-title .product-count');
                if (allCategoryTitle) allCategoryTitle.textContent = totalProducts;

                // Process categories
                Object.entries(productsData).forEach(([categoryName, categoryProducts]) => {
                    const productCount = categoryProducts.length;
                    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');

                    // Add tab
                    tabsContainer.innerHTML += createCategoryTab(categoryName);

                    // Add section
                    categorySectionsContainer.innerHTML += createCategorySection(categoryName, productCount);

                    // Get grid reference
                    const categoryGrid = document.getElementById(`${categoryId}-products-grid`);

                    // Add products
                    const productsHTML = categoryProducts.map(createProductCard).join('');
                    allProductsGrid.innerHTML += productsHTML;
                    if (categoryGrid) categoryGrid.innerHTML = productsHTML;
                });

                // Tab switching
                const categoryTabs = document.querySelectorAll('.category-tab');
                const productCategories = document.querySelectorAll('.product-category');

                categoryTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        categoryTabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');

                        const selectedCategory = tab.dataset.category;
                        productCategories.forEach(category => {
                            category.style.display = category.id === selectedCategory ||
                                (selectedCategory === 'all' && category.id === 'all') ?
                                'block' : 'none';
                        });
                    });
                });

                setupTabScrolling();
            } catch (error) {
                console.error('Error loading products:', error);
                const errorHTML = `
                    <div class="loading">
                        <p>Failed to load products. Please try again later.</p>
                    </div>
                `;
                document.getElementById('all-products-grid').innerHTML = errorHTML;
                document.getElementById('category-tabs-container').innerHTML = errorHTML;
            }
        };

        const loadProductDetails = async () => {
            const varietiesContainer = document.getElementById('product-varieties');
            if (!varietiesContainer) return;

            try {
                const productId = new URLSearchParams(window.location.search).get('product');
                if (!productId) throw new Error('No product specified');

                const response = await fetch('products.json');
                if (!response.ok) throw new Error('Failed to load products');
                const productsData = await response.json();

                // Find product
                let foundProduct = null;
                for (const category in productsData) {
                    foundProduct = productsData[category].find(p => p.id === productId);
                    if (foundProduct) break;
                }
                if (!foundProduct) throw new Error('Product not found');

                // Update page info
                document.title = `${foundProduct.name} - Krrish Impex`;
                const setTextContent = (id, text) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = text;
                };
                setTextContent('product-title', foundProduct.name);
                setTextContent('product-name-breadcrumb', foundProduct.name);

                const descEl = document.getElementById('product-description');
                if (descEl) {
                    descEl.textContent = foundProduct.description || '';
                    if (!foundProduct.description) descEl.style.display = 'none';
                }

                // Display varieties
                if (foundProduct.varieties?.length) {
                    varietiesContainer.innerHTML = foundProduct.varieties.map(createVarietyCard).join('');
                } else {
                    varietiesContainer.innerHTML = `
                        <div class="no-varieties">
                            <p>No varieties available for this product.</p>
                            <a href="contact.html" class="btn">Contact us for custom options</a>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading product details:', error);
                varietiesContainer.innerHTML = `
                    <div class="error">
                        <p>Failed to load product details. Please try again later.</p>
                        <a href="products.html" class="btn">Back to Products</a>
                    </div>
                `;
            }
        };

        return {
            loadProducts,
            loadProductDetails
        };
    })();

    // ==================== TIMELINE ====================
    const initTimeline = () => {
        const navButtons = document.querySelectorAll('.timeline-nav-btn');
        const contentItems = document.querySelectorAll('.timeline-content-item');
        if (!navButtons.length || !contentItems.length) return;

        let currentIndex = 0;
        let intervalId = null;
        const autoPlayDelay = 3000;

        const showTimelineContent = (year) => {
            contentItems.forEach(item => item.classList.remove('active'));
            const target = document.getElementById(`timeline-${year}`);
            if (target) target.classList.add('active');
        };

        const updateActiveNavButton = (index) => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            if (navButtons[index]) navButtons[index].classList.add('active');
        };

        const goToNextYear = () => {
            currentIndex = (currentIndex + 1) % navButtons.length;
            const year = navButtons[currentIndex]?.dataset.year;
            if (year) {
                showTimelineContent(year);
                updateActiveNavButton(currentIndex);
            }
        };

        const startAutoPlay = () => {
            if (!intervalId) {
                intervalId = setInterval(goToNextYear, autoPlayDelay);
            }
        };

        const stopAutoPlay = () => {
            clearInterval(intervalId);
            intervalId = null;
        };

        navButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const targetYear = button.dataset.year;
                if (targetYear) {
                    showTimelineContent(targetYear);
                    currentIndex = index;
                    updateActiveNavButton(currentIndex);
                    stopAutoPlay();
                }
            });
            button.addEventListener('mouseleave', startAutoPlay);
        });

        const timelineContent = document.querySelector('.timeline-content-container');
        if (timelineContent) {
            timelineContent.addEventListener('mouseenter', stopAutoPlay);
            timelineContent.addEventListener('mouseleave', startAutoPlay);
        }

        // Initialize
        navButtons[0]?.classList.add('active');
        contentItems[0]?.classList.add('active');
        startAutoPlay();
    };

    // ==================== TESTIMONIAL CAROUSEL ====================
    const initTestimonialCarousel = () => {
        const track = document.querySelector('.testimonials-track');
        const container = document.querySelector('.testimonials-container');
        const cards = document.querySelectorAll('.testimonial-card');
        const dotsContainer = document.querySelector('.carousel-dots');
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');

        if (!track || !container || !cards.length || !dotsContainer) return;

        let currentIndex = 0;
        let isDragging = false;
        let startPosX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let autoScrollInterval;
        let touchMoved = false;

        // Initialize dots
        dotsContainer.innerHTML = Array.from(cards, (_, i) =>
            `<div class="carousel-dot" data-index="${i}"></div>`
        ).join('');

        const dots = document.querySelectorAll('.carousel-dot');
        const updateDots = () => {
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        };

        const setTransform = () => {
            track.style.transform = `translateX(${currentTranslate}px)`;
        };

        const updateCarousel = () => {
            const cardWidth = cards[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 20;
            currentTranslate = -(currentIndex * (cardWidth + gap));
            prevTranslate = currentTranslate;

            track.style.transition = isDragging ? 'none' : 'transform 0.5s ease-out';
            setTransform();
            updateDots();
        };

        const goToIndex = (index) => {
            currentIndex = index;
            updateCarousel();
        };

        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                if (!isDragging) {
                    currentIndex = (currentIndex + 1) % cards.length;
                    updateCarousel();
                }
            }, 5000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        // Event handlers
        const handleTouchStart = (e) => {
            e.preventDefault();
            startPosX = e.touches[0].clientX;
            touchMoved = false;
            stopAutoScroll();
            isDragging = true;
            track.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentPosX = e.touches[0].clientX;
            const diffX = startPosX - currentPosX;

            if (Math.abs(diffX) > 10) {
                touchMoved = true;
                currentTranslate = prevTranslate - diffX;
                setTransform();
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;

            if (touchMoved) {
                const movedBy = currentTranslate - prevTranslate;
                if (movedBy < -100 && currentIndex < cards.length - 1) {
                    currentIndex += 1;
                } else if (movedBy > 100 && currentIndex > 0) {
                    currentIndex -= 1;
                }
                updateCarousel();
            }

            isDragging = false;
            touchMoved = false;
            startAutoScroll();
        };

        const handleMouseDown = (e) => {
            startPosX = e.clientX;
            isDragging = true;
            track.style.cursor = 'grabbing';
            track.style.transition = 'none';
            stopAutoScroll();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const currentPosX = e.clientX;
            currentTranslate = prevTranslate + (startPosX - currentPosX);
            setTransform();
        };

        const handleMouseUp = () => {
            if (!isDragging) return;

            const movedBy = currentTranslate - prevTranslate;
            if (movedBy < -100 && currentIndex < cards.length - 1) {
                currentIndex += 1;
            } else if (movedBy > 100 && currentIndex > 0) {
                currentIndex -= 1;
            }

            updateCarousel();
            isDragging = false;
            track.style.cursor = 'grab';
            startAutoScroll();
        };

        // Add event listeners
        track.addEventListener('touchstart', handleTouchStart, { passive: false });
        track.addEventListener('touchmove', handleTouchMove, { passive: false });
        track.addEventListener('touchend', handleTouchEnd);

        track.addEventListener('mousedown', handleMouseDown);
        track.addEventListener('mousemove', handleMouseMove);
        track.addEventListener('mouseup', handleMouseUp);
        track.addEventListener('mouseleave', handleMouseUp);

        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                currentIndex = Math.max(currentIndex - 1, 0);
                updateCarousel();
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % cards.length;
                updateCarousel();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToIndex(parseInt(dot.dataset.index));
            });
        });

        container.addEventListener('mouseenter', stopAutoScroll);
        container.addEventListener('mouseleave', startAutoScroll);

        // Initialize
        updateCarousel();
        startAutoScroll();
    };

    // ==================== INITIALIZE ALL COMPONENTS ====================
    initMobileMenu();
    initBackToTop();
    initContactForm();
    initProducts.loadProducts();
    initProducts.loadProductDetails();
    initTimeline();
    initTestimonialCarousel();
});