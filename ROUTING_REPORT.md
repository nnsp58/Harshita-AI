# ROUTING_REPORT.md

| Prompt | Detected Intent | Department | Skill | Offline | LLM Used | Confidence | Reason |
|---|---|---|---|---|---|---|---|
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | pattern |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | pattern |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | keyword |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | pattern |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | pattern |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | pattern |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | pattern |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | keyword |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | info_intercept |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | override |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | override |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | info_intercept |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | override |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | document_intelligence |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | override |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | document_intelligence |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | info_intercept |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | override |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | info_intercept |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | pattern |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | pattern |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | keyword |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | keyword |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | keyword |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | keyword |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | keyword |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | keyword |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | pattern |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
| EMI for 100000 loan at 10% for 12 months | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| 22 front 43 back 50 length plot area | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| gole ka aayatan ka formula | form_fill | General | CLARIFICATION | false | NO | 14% | cache |
| ITR kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR bhar do | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Mera income tax return file karna hai | itr_filing | General | master_tax_agent | false | NO | 100% | cache |
| Gift deed kya hoti hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Gift deed banao | legal_draft | General | legal_draft | false | NO | 100% | cache |
| Resume banao | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Legal notice bhejna hai | legal_notice | General | legal_notice | false | NO | 100% | cache |
| Resume kya hota hai | resume_maker | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| ITR ke bare me batao | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Application likho leave ke liye | application_writer | General | application_writer | false | NO | 100% | cache |
| Application kya hai | general_chat | General | LLM_AGENT (GeneralChat) | true | NO | 95% | cache |
| Write a poem about nature | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Explain quantum computing | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Generate flutter app code | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Write a story about a brave king | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| Mausam batao | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| Delhi weather | utility_tools | General | LLM_AGENT (GeneralChat) | true | NO | 90% | cache |
| help | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| batao | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kya karu | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| random text testing 123 | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| who are you | general_chat | General | CLARIFICATION | true | NO | 17% | cache |
| aapka owner kaun hai | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| kisne banaya hai aapko | general_chat | General | CLARIFICATION | true | NO | 0% | cache |
| kaun ho tum | general_chat | General | LLM_AGENT (GeneralChat) | true | YES | 85% | cache |
| 22+55 | math_skill | General | LLM_AGENT (GeneralChat) | true | NO | 99% | cache |
| 10% of 500 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Area of circle with radius 5 | math_arithmetic | General | CLARIFICATION | true | NO | 14% | cache |
| Calculate GST 18% on 5000 | math_financial | General | LLM_AGENT (GeneralChat) | false | NO | 95% | cache |
| Convert 5 bigha to acre | convert_area | General | unit_conversion_skill | true | NO | 90% | cache |
