<script setup lang="ts">
let id = useRouter().param.id;
if (id === "default") id = "ZGVhZHBvb2wgJiB3b2x2ZXJpbmUK";
const title = Buffer.from(id, "base64").toString();
</script>

<template>
  <div>
    {{ title }}
    <ClientOnly>
      <video
        :src="`http://localhost:3000/api/movies/${id}/stream`"
        controls
      ></video>
    </ClientOnly>
  </div>
</template>
