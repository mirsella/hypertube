<template>
  <div>
    <ClientOnly>
      <!-- "deadpool & wolverine" as base64 -->
      <video
        src="http://localhost:3000/api/movies/ZGVhZHBvb2wgJiB3b2x2ZXJpbmUK/stream"
        controls
      ></video>
    </ClientOnly>
  </div>
</template>
