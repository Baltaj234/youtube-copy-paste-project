window.onload = function () {
    const addButton = document.querySelector('#addVideo');
    const input = document.querySelector('#myInput');
    const playlist = document.querySelector('#playlist');
    const playerContainer = document.querySelector('#player-container');
  
    let videos = JSON.parse(localStorage.getItem('youtubePlaylist')) || [];
    updatePlaylist();
  
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
  
    addButton.addEventListener('click', async function () {
      const url = input.value;
      const id = getId(url);
  
      if (id) {
        const title = await getVideoTitleFromOembed(id);
        videos.push({ id: id, url: url, title: title });
        localStorage.setItem('youtubePlaylist', JSON.stringify(videos));
        updatePlaylist();
        input.value = '';
      }
    });
  
    function updatePlaylist() {
      playlist.innerHTML = '';
      videos.forEach((video, index) => {
        const videoElement = document.createElement('div');
        videoElement.className = 'playlist-item';
        videoElement.innerHTML = `
          <span class="video-title">${video.title}</span>
          <button onclick="playVideo('${video.id}')">Play</button>
          <button onclick="removeVideo(${index})">Remove</button>
        `;
        playlist.appendChild(videoElement);
      });
    }
  
    async function getVideoTitleFromOembed(videoId) {
      try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        return data.title;
      } catch (error) {
        return `Video ${videos.length + 1}`;
      }
    }
  
    window.playVideo = function (id) {
      playerContainer.innerHTML = '';
      const videoWrapper = document.createElement('div');
      videoWrapper.className = 'video-wrapper';
  
      // Create the iframe for YouTube video
      const iframe = document.createElement('iframe');
      iframe.setAttribute('width', '560');
      iframe.setAttribute('height', '315');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${id}`);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
  
      videoWrapper.appendChild(iframe);
      playerContainer.appendChild(videoWrapper);
  
      // Dragging functionality on the video wrapper
      videoWrapper.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);
    }
  
    function dragStart(e) {
      isDragging = true;
  
      const wrapper = e.target.closest('.video-wrapper');
      const style = window.getComputedStyle(wrapper);
      const matrix = new WebKitCSSMatrix(style.transform);
  
      xOffset = matrix.m41;
      yOffset = matrix.m42;
  
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      wrapper.style.cursor = 'grabbing';
    }
  
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
  
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
  
        const wrapper = playerContainer.querySelector('.video-wrapper');
        setTranslate(currentX, currentY, wrapper);
      }
    }
  
    function dragEnd() {
      if (isDragging) {
        isDragging = false;
        const wrapper = playerContainer.querySelector('.video-wrapper');
        wrapper.style.cursor = 'grab';
      }
    }
  
    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  
    window.removeVideo = function (index) {
      videos.splice(index, 1);
      localStorage.setItem('youtubePlaylist', JSON.stringify(videos));
      updatePlaylist();
    }
  }
  
  function getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length == 11) ? match[2] : null;
  }
  