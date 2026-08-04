# Historical relations

This directory is reserved for records that connect stable institutions or places without changing their identities.

Relation kinds include formal subordination, military affiliation, Five Army affiliation, administrative context, co-location, jimi subordination, jimi administrative context, jurisdiction, and political control. Each relation must carry its own validity, confidence, sources, and audit metadata.

Do not encode a governorate, military affiliation, or wartime control area by changing an institution's `parentId` or `polityId`.

Military records use the following direction: `subjectId` is the unit or institution being described, and `objectId` is the military superior, Five Army command, administrative context, or co-located administrative unit. A file region under `units/military/` identifies the seat or location partition only; it is not a claim of civil jurisdiction.

Jimi subordination uses the same direction: `subjectId` is the subordinate jimi institution and `objectId` is its recorded jimi superior. Jimi administrative context remains a separate relation and must not be used to infer a jimi hierarchy. Frontend hierarchy labels such as first-, second-, and third-level are derived from the recorded subordination chain and do not replace historical source claims.
