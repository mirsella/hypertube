<template>
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>
						<label>
							<input
								type="checkbox"
								class="checkbox" />
						</label>
					</th>
					<th>username</th>
					<th>Name</th>
					<th>Favorite Color</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
				<tr>
					<th>
						<label>
							<input
								type="checkbox"
								class="checkbox" />
						</label>
					</th>
					<td>
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="mask mask-squircle h-12 w-12">
									<img
										src="https://img.daisyui.com/images/profile/demo/2@94.webp"
										alt="Avatar Tailwind CSS Component" />
								</div>
							</div>
							<div>
								<div class="font-bold">Hart Hagerty</div>
								<div class="text-sm opacity-50">United States</div>
								<!-- <th> username: {{ props.username }} </th> -->
								<th>name: {{ props.name }}</th>
							</div>
						</div>
					</td>
					<td>
						Zemlak, Daniel and Leannon
						<br />
						<span class="badge badge-ghost badge-sm">Desktop Support Technician</span>
					</td>
					<!-- <td>Last time</td> -->
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	username: string;
	password: string;
}>();
</script>
