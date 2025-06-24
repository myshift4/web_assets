document.addEventListener('DOMContentLoaded', function() {

    //========= 评论相关元素 ===========================================
    const commentInput = document.getElementById('commentInput');
    const submitComment = document.getElementById('submitComment');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentCount = document.getElementById('commentCount');
    const charCounter = document.getElementById('charCounter');
    const pagination = document.getElementById('pagination');
    const sortOptions = document.getElementById('sortOptions');
    const noComments = document.getElementById('noComments');
    
    // 评论数据
    let comments = [];
    let currentPage = 1;
    const commentsPerPage = 3;
    let sortOrder = 'newest'; // 'newest' 或 'oldest'
    
    function setupEventListeners() {
        // 评论输入框事件
        commentInput.addEventListener('input', updateCharCounter);
        // 提交评论按钮
        submitComment.addEventListener('click', addComment);
        // 排序选项
        sortOptions.addEventListener('click', function(e) {
            if (e.target.tagName === 'SPAN' && e.target.dataset.sort) {
                sortOrder = e.target.dataset.sort;
                renderComments();
                // 更新排序UI
                document.querySelectorAll('#sortOptions span').forEach(span => {
                    span.classList.remove('text-blue-600', 'font-medium');
                });
                e.target.classList.add('text-blue-600', 'font-medium');
            }
        });
        
        // 支持按Enter提交评论
        commentInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addComment();
            }
        });
    }
    
    // 评论功能相关函数
    function updateCharCounter() {
        const length = commentInput.value.length;
        charCounter.textContent = `${length}/100`;
        if (length >= 90) {
            charCounter.classList.add('warning');
        } else {
            charCounter.classList.remove('warning');
        }
    }
    
    function addComment() {
        const content = commentInput.value.trim();
        
        if (!content) {
            alert('评论内容不能为空');
            return;
        }
        
        if (content.length > 100) {
            alert('评论内容不能超过100字');
            return;
        }
        
        const newComment = {
            id: Date.now(),
            content: content,
            author: getRandomUsername(),
            timestamp: new Date().toISOString(),
            likes: 0
        };
        
        comments.unshift(newComment);
        saveComments();
        renderComments();
        
        // 清空输入框
        commentInput.value = '';
        updateCharCounter();
        
        // 显示成功消息
        const successMsg = document.createElement('div');
        successMsg.textContent = '评论已发布！';
        successMsg.className = 'text-green-600 font-medium mb-4 text-center animate-pulse';
        commentsContainer.parentNode.insertBefore(successMsg, commentsContainer);
        
        setTimeout(() => {
            successMsg.remove();
        }, 2000);
    }
    
    function getRandomUsername() {
        const names = ['设计师小明', '前端开发', 'UI爱好者', '色彩研究员', '创意总监', '视觉设计师', '用户体验师', '艺术指导'];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    function saveComments() {
        localStorage.setItem('colorPickerComments', JSON.stringify(comments));
    }
    
    function loadComments() {
        const savedComments = localStorage.getItem('colorPickerComments');
        if (savedComments) {
            comments = JSON.parse(savedComments);
        }
        renderComments();
    }
    
    function renderComments() {
        // 排序评论
        const sortedComments = [...comments];
        if (sortOrder === 'newest') {
            sortedComments.sort((a, b) => b.id - a.id);
        } else {
            sortedComments.sort((a, b) => a.id - b.id);
        }
        
        // 更新评论计数
        commentCount.textContent = comments.length;
        
        // 如果没有评论
        if (comments.length === 0) {
            noComments.style.display = 'block';
            commentsContainer.innerHTML = '';
            renderPagination();
            return;
        }
        
        noComments.style.display = 'none';
        
        // 计算分页
        const totalPages = Math.ceil(sortedComments.length / commentsPerPage);
        const startIndex = (currentPage - 1) * commentsPerPage;
        const paginatedComments = sortedComments.slice(startIndex, startIndex + commentsPerPage);
        
        // 渲染评论
        commentsContainer.innerHTML = '';
        paginatedComments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-card';
            
            const date = new Date(comment.timestamp);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="user-avatar">${comment.author.charAt(0)}</div>
                    <div>
                        <div class="font-bold">${comment.author}</div>
                    </div>
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-meta">
                    <span>${formattedDate}</span>
                </div>
            `;
            
            commentsContainer.appendChild(commentElement);
        });
        
        // 渲染分页
        renderPagination(totalPages);
    }
    
    function renderPagination(totalPages = 0) {
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        pagination.innerHTML = '';
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderComments();
            }
        });
        pagination.appendChild(prevBtn);
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderComments();
            });
            pagination.appendChild(pageBtn);
        }
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderComments();
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    // 评论相关函数的加载
    loadComments();
    updateCharCounter();
    setupEventListeners();

});



