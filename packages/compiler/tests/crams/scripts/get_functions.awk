#!/usr/bin/awk -f

/Compiled private Publicodes rules/ { in_funcs = 1; next }
!in_funcs { next }
/Exported outputs/ { exit }

/function/ { in_func = 1; printf "\n" }
!in_func { next }
/^}/ { in_func = 0; next }
{ print }
