import Vue from "vue";
import { Component } from "vue-property-decorator";
import { EGameMode, EGameModeType } from "@/store/typings";
import { SeasonMap } from "@/store/admin/mapsManagement/types";
import { useMapsManagementStore } from "@/store/admin/mapsManagement/store";

const AT_EQUIVALENT: { [key: number]: EGameMode } = {
  [EGameMode.GM_2ON2]: EGameMode.GM_2ON2_AT,
  [EGameMode.GM_4ON4]: EGameMode.GM_4ON4_AT,
  [EGameMode.GM_LEGION_4v4_X20]: EGameMode.GM_LEGION_4v4_X20_AT,
  [EGameMode.GM_DOTA_5ON5]: EGameMode.GM_DOTA_5ON5_AT,
};

@Component
export default class GameModesMixin extends Vue {
  private mapsManagementStore = useMapsManagementStore();

  public async loadActiveGameModes() {
    await this.mapsManagementStore.loadMapsForCurrentSeason();
  }

  public get activeGameModes() {
    return this.getGameModes(null, false);
  }

  public get activeGameModesWithAll() {
    return [
      {
        name: this.$t(`gameModes.${EGameMode[EGameMode.UNDEFINED]}`),
        id: EGameMode.UNDEFINED,
      },
      ...this.activeGameModes,
    ];
  }

  public get activeGameModesWithAT() {
    return this.getGameModes(null, true);
  }

  public get activeMeleeGameModes() {
    return this.getGameModes(EGameModeType.MELEE, false);
  }

  public get activeMeleeGameModesWithAT() {
    return this.getGameModes(EGameModeType.MELEE, true);
  }

  public get AT_modes() {
    return Object.values(AT_EQUIVALENT);
  }

  private getGameModes(type: EGameModeType | null, withAt: boolean) {
    return this.mapsManagementStore.seasonMaps
      .reduce((result: SeasonMap[], seasonMap: SeasonMap) => {
        result.push(seasonMap);
        if (withAt && AT_EQUIVALENT[seasonMap.id]) {
          result.push({
            ...seasonMap,
            id: AT_EQUIVALENT[seasonMap.id],
            gameMode: seasonMap.gameMode + " AT",
          });
        }
        return result;
      }, [])
      .filter((seasonMap) => type === null || seasonMap.type === type)
      .map((seasonMap) => {
        const id = seasonMap.id;
        const name = this.$t(`gameModes.${EGameMode[id]}`) || seasonMap.gameMode;
        return {
          id,
          name,
        };
      });
  }
}