(function () {
    var savedTheme = localStorage.getItem('theme');
    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);

    requestAnimationFrame(function () {
        document.body.classList.add('js-ready');
    });

    var headline = document.getElementById('intro-headline');
    if (headline && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var charIndex = 0;
        var lines = headline.querySelectorAll('.hl-line');
        lines.forEach(function (line) {
            var text = line.textContent;
            line.textContent = '';
            text.split('').forEach(function (ch) {
                if (ch === ' ') {
                    var space = document.createElement('span');
                    space.className = 'hl-space';
                    space.setAttribute('aria-hidden', 'true');
                    line.appendChild(space);
                    return;
                }
                var span = document.createElement('span');
                span.className = 'hl-char';
                span.textContent = ch;
                span.setAttribute('aria-hidden', 'true');
                span.style.setProperty('--char-i', charIndex);
                line.appendChild(span);
                charIndex++;
            });
        });
        headline.setAttribute('aria-label', 'Building things that matter.');
    }

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    var header = document.getElementById('site-header');
    var scrollProgress = document.getElementById('scroll-progress');
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
        var current = window.scrollY;
        if (current > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        if (scrollProgress) {
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (current / docHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        }
        lastScroll = current;
    }, { passive: true });

    var menuTrigger = document.getElementById('menu-trigger');
    var navList = document.getElementById('nav-list');
    var overlay = document.getElementById('mobile-overlay');

    function openMenu() {
        menuTrigger.classList.add('open');
        menuTrigger.setAttribute('aria-expanded', 'true');
        navList.classList.add('open');
        overlay.classList.add('visible');
    }

    function closeMenu() {
        menuTrigger.classList.remove('open');
        menuTrigger.setAttribute('aria-expanded', 'false');
        navList.classList.remove('open');
        overlay.classList.remove('visible');
    }

    menuTrigger.addEventListener('click', function () {
        if (navList.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    navList.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    var navAnchors = document.querySelectorAll('.nav-link[data-scroll-to]');
    var sections = document.querySelectorAll('section[id]');

    var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var id = entry.target.getAttribute('id');
                navAnchors.forEach(function (a) {
                    a.classList.remove('active');
                    if (a.getAttribute('data-scroll-to') === id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' });

    sections.forEach(function (section) {
        navObserver.observe(section);
    });

    var revealElements = document.querySelectorAll('.reveal-block, .reveal-up');
    var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

    var staggerCards = document.querySelectorAll('.craft-card');
    var staggerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var cards = entry.target.parentElement.querySelectorAll('.craft-card');
                cards.forEach(function (card, i) {
                    setTimeout(function () {
                        card.classList.add('visible');
                    }, i * 100);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (staggerCards.length > 0) {
        staggerObserver.observe(staggerCards[0]);
    }

    var githubUsername = 'leo-kun19';
    var worksList = document.getElementById('works-list');

    fetch('https://api.github.com/users/' + githubUsername + '/repos?sort=updated&direction=desc&per_page=30')
        .then(function (response) {
            if (!response.ok) return Promise.reject(response);
            return response.json();
        })
        .then(function (repos) {
            worksList.innerHTML = '';
            repos.forEach(function (repo, index) {
                var item = document.createElement('a');
                item.href = repo.html_url;
                item.target = '_blank';
                item.className = 'work-item';
                item.setAttribute('rel', 'noopener noreferrer');

                var indexStr = String(index + 1).padStart(2, '0');
                var name = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
                var desc = repo.description || 'A project showcasing development skills and practical solutions.';
                var tags = '';

                if (repo.language) {
                    tags += '<span class="work-tag">' + repo.language + '</span>';
                }
                if (repo.topics) {
                    repo.topics.slice(0, 3).forEach(function (topic) {
                        tags += '<span class="work-tag">' + topic + '</span>';
                    });
                }

                item.innerHTML =
                    '<span class="work-index">' + indexStr + '</span>' +
                    '<div class="work-info">' +
                    '<h3>' + name + '</h3>' +
                    '<p>' + desc + '</p>' +
                    (tags ? '<div class="work-tags">' + tags + '</div>' : '') +
                    '</div>' +
                    '<span class="work-arrow"><i data-lucide="arrow-up-right"></i></span>';

                worksList.appendChild(item);
            });

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        })
        .catch(function () {
            worksList.innerHTML = '<p class="error-message">Could not load projects from GitHub right now. Try refreshing.</p>';
        });

    var liveShots = document.querySelectorAll('.live-shot');
    liveShots.forEach(function (img) {
        function markLoaded() {
            img.classList.add('loaded');
            img.classList.remove('shot-error');
        }

        if (img.complete && img.naturalWidth > 0) {
            markLoaded();
        }

        img.addEventListener('load', markLoaded);
        img.addEventListener('error', function () {
            if (!img.classList.contains('loaded')) {
                img.classList.add('shot-error');
            }
        });

        var base = img.getAttribute('src');
        [4000, 9000, 15000, 24000].forEach(function (delay) {
            setTimeout(function () {
                var probe = new Image();
                probe.onload = function () {
                    img.src = probe.src;
                    markLoaded();
                };
                probe.src = base + '&r=' + delay;
            }, delay);
        });
    });

    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            var btn = document.getElementById('submit-btn');
            var originalText = btn.querySelector('span').textContent;
            btn.querySelector('span').textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(function () {
                btn.querySelector('span').textContent = originalText;
                btn.disabled = false;
            }, 4000);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
})();
