#!/usr/bin/awk -f

/^ *$/ { next }
/const rules = {/ { enabled=1 }
/export default rules;/ { enabled=0 }
!enabled { next }
{ print }
