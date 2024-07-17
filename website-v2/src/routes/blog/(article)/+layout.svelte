<script>
    import Button from '$lib/ui/button.svelte';
    import { ArrowLeft } from 'lucide-svelte';
</script>

<article class="lg:py-18 flex justify-center px-6 py-14">
    <div class="flex flex-col gap-16">
        <div class="flex items-start">
            <a href="/blog">
                <Button type="secondary" icon={ArrowLeft} light>Retourner à la liste</Button>
            </a>
        </div>
        <div class="prose lg:prose-lg">
            <slot></slot>
        </div>
    </div>
</article>
