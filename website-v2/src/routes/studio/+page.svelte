<script lang="ts">
    import PublicodesEditor from '$lib/PublicodesEditor/index.svelte';
    const code = `
# Bienvenue dans le bac à sable du langage publicode !
# Pour apprendre le langage :
# => https://publi.codes/tutoriel
    `;
</script>

<div class="publicodes-container flex max-h-full flex-1 flex-col">
    <PublicodesEditor {code} title={'Publicodes studio'} />
</div>

<style>
    .publicodes-container > :global(:first-child) {
        @apply flex-1 rounded-none;
    }
</style>
