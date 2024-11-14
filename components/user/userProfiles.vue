<template>
  <div class="p-4">
    <!-- Formulaire de recherche -->
    <div class="flex gap-4 mb-4">
      <input
        type="text"
        v-model="searchQuery.username"
        :placeholder="$t('userProfiles.fullusername')"
        class="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        v-model="searchQuery.fullname"
        :placeholder="$t('userProfiles.fullnamePlaceholder')"
        class="input input-bordered w-full max-w-xs"
      />
    </div>

    <!-- Tableau des profils utilisateurs -->
    <div class="overflow-x-auto w-full">
      <table class="table w-full">
        <!-- head -->
        <thead>
          <tr>
            <th class="text-lg">{{ $t("userProfiles.username") }}</th>
            <th class="text-lg">{{ $t("userProfiles.fullname") }}</th>
            <th class="text-lg">{{ $t("userProfiles.profilepicture") }}</th>
            <th class="text-lg">{{ $t("userProfiles.comments") }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- Afficher uniquement les utilisateurs filtrés avec un profil complet -->
          <template v-for="user in filteredUsers" :key="user.id">
            <tr v-if="user.complete_profile === true" class="hover h-24">
              <td class="text-base lg:text-lg align-middle">
                {{ user.username }}
              </td>
              <td class="text-base lg:text-lg align-middle">
                <div>{{ user.firstname }} {{ user.lastname }}</div>
              </td>
              <td class="text-base lg:text-lg align-middle">
                <div
                  class="mask mask-squircle w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                >
                  <img
                    :src="
                      user.profile_picture
                        ? `http://localhost:3000/${user.profile_picture}`
                        : 'https://img.daisyui.com/images/profile/demo/2@94.webp'
                    "
                    alt="Profile picture"
                    class="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td class="text-base lg:text-lg align-middle">
                <div>Nb comments</div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture?: string;
  complete_profile: boolean;
}
const props = defineProps<{
  users: User[];
}>();
const { t, locale } = useI18n();

// État pour les critères de recherche
const searchQuery = ref({
  username: "",
  fullname: "",
});

const filteredUsers = computed(() => {
  // A chaque changement de searchQuery donc à chaque frappe de l'utilisateur
  return props.users.filter((user) => {
    // Cree un tableau de tous les utilisateurs filtrés
    const fullName = `${user.firstname} ${user.lastname}`; //
    return (
      user.username
        .toLowerCase()
        .includes(searchQuery.value.username.toLowerCase()) &&
      fullName.toLowerCase().includes(searchQuery.value.fullname.toLowerCase())
    ); // Si vide alors retourne tous les utilisateurs
  });
});
</script>
