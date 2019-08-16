/**
 * @name Reroll-Initiative
 * @version 0.1
 * @author Evan Clarke <errational>
 * @description Rerolls initiative on combat round change
 */

/**
 * Hook on game ready and then execute the module function
 */
Hooks.on("ready", () => {
    rerollInitiative();
});

/**
 * Main module function
 */
function rerollInitiative() {
    const MODULE_NAME = "reroll-initiative";
    console.log(MODULE_NAME + " starting.");

    let settings = {};

    const DEFAULT_CONFIG = true;

    const SETTINGS_NAME = "Reroll Initiative";

    const SETTINGS_HINT = "Reroll initiative for each combatant every round"

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        hint: SETTINGS_HINT,
        scope: "world",
        type: Boolean,
        default: DEFAULT_CONFIG,
        config: true,
        onChange: s => {
            settings = s;
            console.log(MODULE_NAME+" settings changed to", s);
        }
    }

    try {
        settings = getModuleSettings();
    }
    catch (e) {
        if(e.message == "This is not a registered game setting") {
            registerModuleSettings();
            settings = getModuleSettings();
        }
        else {
            throw e;
        }

    }

    function getModuleSettings() {
        return game.settings.get(MODULE_NAME, SETTINGS_NAME);
    }
    
    function registerModuleSettings() {
        game.settings.register(MODULE_NAME, SETTINGS_NAME, SETTINGS_META);
    }    

    /**
     * Update module settings and save to the game
     * @param {String} setting 
     * @param {*} value 
     */
    async function updateSettings(setting, value) {
        settings[setting] = value;
        console.log("Updating " + MODULE_NAME + " settings:", settings);
        await game.settings.set(MODULE_NAME, SETTINGS_NAME, settings);
    }

    /**
     * Hook on update of Combat class. 
     * Reroll initiative if requirements met
     */
    Hooks.on("updateCombat",(async (combat, update) => {
        const SETTING = "reroll";
        
        /**
         *  firstly is the specified module setting turned on (eg. is rerolling enabled), 
         *  then test for the presence of the combat object's previous values and an update object,
         *  check that the round props are numbers,
         *  finally test if the update's round is greater than the previous combat round 
         */
         if(settings && (combat.previous && update) && !isNaN(combat.previous.round || update.round) && update.round > combat.previous.round){
            await combat.resetAll();
            combat.rollAll();
        }
    }));

    
    /**
     * Hook on render of Combat Tracker Config app. 
     * Inject checkbox formgroup, resize window and add new logic on submit
     */

     /*
    Hooks.on("renderCombatTrackerConfig", (app, html) => {
        const SETTING = "reroll";
        const LABEL = "Reroll Initiative";
        const NAME = "rriCheckbox"
        const HINT = "Reroll Initiative for all combatants each round"

        //use the current value of the module setting to determine the checkbox state
        function checked() {
            if(settings[SETTING]) {
                return "checked"
            }
            else {
                return ""
            }
        }

        //find the submit button on the form then inject the new checkbox formgroup above it
        const submit = html.find('button[type="submit"]');

        if(submit) {
            submit.before(
                `<hr/>
                <div class="form-group">
                    <label>${LABEL}</label>
                    <input type="checkbox" name=${NAME} data-dtype="Boolean" ${checked()}>
                    <p class=hint>${HINT}</p>
                </div>`
            );
            
            //resize the window to fit the new elements
            app.setPosition({height: app.position.height + 60});
            
            //find the form then latch onto the submit event to update the module settings    
            const form = submit.parent();
    
            form.on("submit", (ev) => {
                const input = ev.target.elements[NAME];
    
                if(input) {
                    updateSettings(SETTING, input.checked);
                } 
            });
        }
        
        
    });
    */
}